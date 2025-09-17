<?php

namespace FCCRM;

/**
 * API レスポンス処理クラス
 */
class ApiResponse
{
    private $data;
    private $status_code;
    private $message;
    private $errors;

    public function __construct()
    {
        $this->data = null;
        $this->status_code = 200;
        $this->message = '';
        $this->errors = [];
    }

    /**
     * 成功レスポンスの設定
     */
    public function success($data = null, string $message = '', int $status_code = 200): self
    {
        $this->data = $data;
        $this->message = $message;
        $this->status_code = $status_code;
        $this->errors = [];
        return $this;
    }

    /**
     * エラーレスポンスの設定
     */
    public function error(string $message, int $status_code = 400, array $errors = []): self
    {
        $this->data = null;
        $this->message = $message;
        $this->status_code = $status_code;
        $this->errors = $errors;
        return $this;
    }

    /**
     * バリデーションエラーレスポンスの設定
     */
    public function validationError(array $errors, string $message = 'バリデーションエラーが発生しました'): self
    {
        return $this->error($message, 422, $errors);
    }

    /**
     * 認証エラーレスポンスの設定
     */
    public function unauthorized(string $message = '認証が必要です'): self
    {
        return $this->error($message, 401);
    }

    /**
     * 権限エラーレスポンスの設定
     */
    public function forbidden(string $message = 'アクセスが禁止されています'): self
    {
        return $this->error($message, 403);
    }

    /**
     * リソース未発見エラーレスポンスの設定
     */
    public function notFound(string $message = 'リソースが見つかりません'): self
    {
        return $this->error($message, 404);
    }

    /**
     * サーバーエラーレスポンスの設定
     */
    public function serverError(string $message = 'サーバー内部エラーが発生しました'): self
    {
        return $this->error($message, 500);
    }

    /**
     * ページネーション付きレスポンスの設定
     */
    public function paginated(array $data, int $total, int $page, int $per_page, string $message = ''): self
    {
        $last_page = ceil($total / $per_page);

        $pagination = [
            'data' => $data,
            'meta' => [
                'total' => $total,
                'per_page' => $per_page,
                'current_page' => $page,
                'last_page' => $last_page,
                'from' => ($page - 1) * $per_page + 1,
                'to' => min($page * $per_page, $total)
            ]
        ];

        return $this->success($pagination, $message);
    }

    /**
     * JSONレスポンスの送信
     */
    public function send(): void
    {
        http_response_code($this->status_code);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => $this->status_code >= 200 && $this->status_code < 300,
            'status_code' => $this->status_code,
            'message' => $this->message,
            'data' => $this->data
        ];

        if (!empty($this->errors)) {
            $response['errors'] = $this->errors;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * レスポンス配列の取得（テスト用）
     */
    public function toArray(): array
    {
        $response = [
            'success' => $this->status_code >= 200 && $this->status_code < 300,
            'status_code' => $this->status_code,
            'message' => $this->message,
            'data' => $this->data
        ];

        if (!empty($this->errors)) {
            $response['errors'] = $this->errors;
        }

        return $response;
    }

    /**
     * CORS ヘッダーの設定
     */
    public static function setCorsHeaders(): void
    {
        $allowed_origins = explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? '');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowed_origins) || in_array('*', $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }

        header('Access-Control-Allow-Methods: ' . ($_ENV['CORS_ALLOWED_METHODS'] ?? 'GET,POST,PUT,DELETE,OPTIONS'));
        header('Access-Control-Allow-Headers: ' . ($_ENV['CORS_ALLOWED_HEADERS'] ?? 'Content-Type,Authorization'));
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 3600');

        // OPTIONSリクエストへの対応
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    /**
     * セキュリティヘッダーの設定
     */
    public static function setSecurityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');

        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        }
    }
}