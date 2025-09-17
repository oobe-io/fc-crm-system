<?php

namespace FCCRM;

/**
 * シンプルなAPIルーター
 */
class Router
{
    private array $routes = [];
    private array $middlewares = [];

    /**
     * GETルートの登録
     */
    public function get(string $path, callable $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    /**
     * POSTルートの登録
     */
    public function post(string $path, callable $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    /**
     * PUTルートの登録
     */
    public function put(string $path, callable $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    /**
     * DELETEルートの登録
     */
    public function delete(string $path, callable $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    /**
     * ルートの追加
     */
    private function addRoute(string $method, string $path, callable $handler): void
    {
        $pattern = $this->convertToRegex($path);
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'path' => $path,
            'handler' => $handler
        ];
    }

    /**
     * パスを正規表現に変換
     */
    private function convertToRegex(string $path): string
    {
        // パラメータ {id} を正規表現に変換
        $pattern = preg_replace('/\{([^}]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    /**
     * ミドルウェアの追加
     */
    public function middleware(callable $middleware): void
    {
        $this->middlewares[] = $middleware;
    }

    /**
     * ルートの実行
     */
    public function run(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $this->getPath();

        // ミドルウェアの実行
        foreach ($this->middlewares as $middleware) {
            $result = $middleware();
            if ($result === false) {
                return; // ミドルウェアで処理を停止
            }
        }

        // ルートの検索と実行
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['pattern'], $path, $matches)) {
                // パラメータの抽出
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }

                // ハンドラーの実行
                try {
                    call_user_func($route['handler'], $params);
                } catch (\Exception $e) {
                    $this->handleException($e);
                }
                return;
            }
        }

        // ルートが見つからない場合
        $this->notFound();
    }

    /**
     * パスの取得
     */
    private function getPath(): string
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // /api プレフィックスを除去
        if (str_starts_with($path, '/api')) {
            $path = substr($path, 4);
        }

        return $path ?: '/';
    }

    /**
     * 404エラーの処理
     */
    private function notFound(): void
    {
        $response = new ApiResponse();
        $response->notFound('APIエンドポイントが見つかりません')->send();
    }

    /**
     * 例外の処理
     */
    private function handleException(\Exception $e): void
    {
        // ログの記録
        error_log("API Exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());

        $response = new ApiResponse();

        if ($_ENV['DEBUG'] === 'true') {
            // デバッグモードの場合は詳細なエラー情報を返す
            $response->serverError($e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
        } else {
            // 本番環境では一般的なエラーメッセージ
            $response->serverError('サーバー内部エラーが発生しました');
        }

        $response->send();
    }

    /**
     * リクエストボディの取得
     */
    public static function getRequestBody(): array
    {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON format', 400);
        }

        return $data ?: [];
    }

    /**
     * クエリパラメータの取得
     */
    public static function getQueryParams(): array
    {
        return $_GET;
    }

    /**
     * ヘッダーの取得
     */
    public static function getHeader(string $name): ?string
    {
        $headers = getallheaders();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === strtolower($name)) {
                return $value;
            }
        }
        return null;
    }
}