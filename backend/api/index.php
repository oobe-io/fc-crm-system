<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use FCCRM\Database;
use FCCRM\ApiResponse;
use FCCRM\Router;
use FCCRM\Logger;
use Dotenv\Dotenv;

// エラーレポートの設定
error_reporting(E_ALL);
ini_set('display_errors', ($_ENV['DEBUG'] ?? 'false') === 'true' ? '1' : '0');

// 環境変数の読み込み
try {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../config');
    $dotenv->load();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => '設定ファイルの読み込みに失敗しました'], JSON_UNESCAPED_UNICODE);
    exit;
}

// タイムゾーンの設定
date_default_timezone_set($_ENV['TIMEZONE'] ?? 'Asia/Tokyo');

// CORSとセキュリティヘッダーの設定
ApiResponse::setCorsHeaders();
ApiResponse::setSecurityHeaders();

// ルーターの初期化
$router = new Router();
$logger = new Logger();

// リクエスト開始時間の記録
$start_time = microtime(true);

// ミドルウェア：リクエストログ
$router->middleware(function() use ($logger, $start_time) {
    $endpoint = $_SERVER['REQUEST_URI'];
    $method = $_SERVER['REQUEST_METHOD'];

    // OPTIONSリクエストはログしない
    if ($method === 'OPTIONS') {
        return true;
    }

    register_shutdown_function(function() use ($logger, $endpoint, $method, $start_time) {
        $execution_time = microtime(true) - $start_time;
        $response_status = http_response_code();

        $logger->logApiRequest(
            $endpoint,
            $method,
            $_REQUEST,
            null, // レスポンスデータは実装時に追加
            $response_status,
            $execution_time
        );
    });

    return true;
});

// =====================
// 企業管理 API
// =====================

// 企業一覧取得
$router->get('/companies', function($params) {
    $response = new ApiResponse();

    try {
        $db = Database::getInstance();
        $query_params = Router::getQueryParams();

        // ページネーション
        $page = max(1, intval($query_params['page'] ?? 1));
        $per_page = min(100, max(1, intval($query_params['per_page'] ?? 20)));
        $offset = ($page - 1) * $per_page;

        // フィルタリング
        $where_conditions = [];
        $bind_params = [];

        if (!empty($query_params['category'])) {
            $where_conditions[] = "category = ?";
            $bind_params[] = $query_params['category'];
        }

        if (!empty($query_params['status'])) {
            $where_conditions[] = "status = ?";
            $bind_params[] = $query_params['status'];
        }

        if (!empty($query_params['search'])) {
            $where_conditions[] = "(company_name LIKE ? OR domain LIKE ?)";
            $search_term = '%' . $query_params['search'] . '%';
            $bind_params[] = $search_term;
            $bind_params[] = $search_term;
        }

        $where_clause = empty($where_conditions) ? '' : 'WHERE ' . implode(' AND ', $where_conditions);

        // 総件数取得
        $count_sql = "SELECT COUNT(*) as total FROM companies $where_clause";
        $total_result = $db->fetchOne($count_sql, $bind_params);
        $total = $total_result['total'];

        // データ取得
        $sql = "SELECT * FROM companies $where_clause ORDER BY created_at DESC LIMIT $per_page OFFSET $offset";
        $companies = $db->fetchAll($sql, $bind_params);

        $response->paginated($companies, $total, $page, $per_page, '企業一覧を取得しました');

    } catch (Exception $e) {
        $response->serverError('企業一覧の取得に失敗しました');
    }

    $response->send();
});

// 企業詳細取得
$router->get('/companies/{id}', function($params) {
    $response = new ApiResponse();

    try {
        $db = Database::getInstance();
        $company_id = intval($params['id']);

        $sql = "SELECT * FROM companies WHERE id = ?";
        $company = $db->fetchOne($sql, [$company_id]);

        if (!$company) {
            $response->notFound('企業が見つかりません')->send();
        }

        $response->success($company, '企業詳細を取得しました');

    } catch (Exception $e) {
        $response->serverError('企業詳細の取得に失敗しました');
    }

    $response->send();
});

// 企業登録
$router->post('/companies', function($params) {
    $response = new ApiResponse();

    try {
        $data = Router::getRequestBody();

        // バリデーション
        $errors = [];
        if (empty($data['company_name'])) {
            $errors['company_name'] = '企業名は必須です';
        }
        if (empty($data['domain'])) {
            $errors['domain'] = 'ドメインは必須です';
        }

        if (!empty($errors)) {
            $response->validationError($errors)->send();
        }

        $db = Database::getInstance();

        // ドメインの重複チェック
        $existing = $db->fetchOne("SELECT id FROM companies WHERE domain = ?", [$data['domain']]);
        if ($existing) {
            $response->error('このドメインは既に登録されています', 409)->send();
        }

        // 企業登録
        $sql = "INSERT INTO companies (
            company_name, domain, industry, contact_form_url,
            category, priority, has_recaptcha, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $params = [
            $data['company_name'],
            $data['domain'],
            $data['industry'] ?? null,
            $data['contact_form_url'] ?? null,
            $data['category'] ?? 'メイン',
            intval($data['priority'] ?? 1),
            !empty($data['has_recaptcha']),
            $data['notes'] ?? null,
            $data['status'] ?? 'active'
        ];

        $company_id = $db->insert($sql, $params);

        $response->success(['id' => $company_id], '企業を登録しました', 201);

    } catch (Exception $e) {
        $response->serverError('企業の登録に失敗しました');
    }

    $response->send();
});

// 企業更新
$router->put('/companies/{id}', function($params) {
    $response = new ApiResponse();

    try {
        $company_id = intval($params['id']);
        $data = Router::getRequestBody();

        $db = Database::getInstance();

        // 企業の存在確認
        $existing = $db->fetchOne("SELECT id FROM companies WHERE id = ?", [$company_id]);
        if (!$existing) {
            $response->notFound('企業が見つかりません')->send();
        }

        // 更新フィールドの準備
        $update_fields = [];
        $params = [];

        $allowed_fields = [
            'company_name', 'domain', 'industry', 'contact_form_url',
            'category', 'priority', 'has_recaptcha', 'notes', 'status'
        ];

        foreach ($allowed_fields as $field) {
            if (array_key_exists($field, $data)) {
                $update_fields[] = "$field = ?";
                if ($field === 'priority') {
                    $params[] = intval($data[$field]);
                } elseif ($field === 'has_recaptcha') {
                    $params[] = !empty($data[$field]);
                } else {
                    $params[] = $data[$field];
                }
            }
        }

        if (empty($update_fields)) {
            $response->error('更新データが提供されていません')->send();
        }

        $params[] = $company_id;

        $sql = "UPDATE companies SET " . implode(', ', $update_fields) . " WHERE id = ?";
        $affected_rows = $db->execute($sql, $params);

        if ($affected_rows > 0) {
            $response->success(null, '企業情報を更新しました');
        } else {
            $response->error('更新対象のデータがありません');
        }

    } catch (Exception $e) {
        $response->serverError('企業情報の更新に失敗しました');
    }

    $response->send();
});

// 企業削除
$router->delete('/companies/{id}', function($params) {
    $response = new ApiResponse();

    try {
        $company_id = intval($params['id']);
        $db = Database::getInstance();

        // 企業の存在確認
        $existing = $db->fetchOne("SELECT id FROM companies WHERE id = ?", [$company_id]);
        if (!$existing) {
            $response->notFound('企業が見つかりません')->send();
        }

        // 関連データの存在確認
        $send_history_count = $db->fetchOne("SELECT COUNT(*) as count FROM send_history WHERE company_id = ?", [$company_id]);

        if ($send_history_count['count'] > 0) {
            // 送信履歴がある場合は削除ではなく無効化
            $db->execute("UPDATE companies SET status = 'inactive' WHERE id = ?", [$company_id]);
            $response->success(null, '企業を無効化しました（送信履歴があるため削除できません）');
        } else {
            // 送信履歴がない場合は物理削除
            $db->execute("DELETE FROM companies WHERE id = ?", [$company_id]);
            $response->success(null, '企業を削除しました');
        }

    } catch (Exception $e) {
        $response->serverError('企業の削除に失敗しました');
    }

    $response->send();
});

// =====================
// ヘルスチェック API
// =====================

$router->get('/health', function($params) {
    $response = new ApiResponse();

    try {
        $db = Database::getInstance();
        $db_connected = $db->isConnected();

        $health_data = [
            'status' => $db_connected ? 'healthy' : 'unhealthy',
            'database' => $db_connected,
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ];

        if ($db_connected) {
            $response->success($health_data, 'システムは正常です');
        } else {
            $response->error('データベース接続エラー', 503, $health_data);
        }

    } catch (Exception $e) {
        $response->serverError('ヘルスチェックに失敗しました');
    }

    $response->send();
});

// ルーターの実行
$router->run();