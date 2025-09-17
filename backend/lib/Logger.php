<?php

namespace FCCRM;

/**
 * ログ管理クラス
 */
class Logger
{
    private Database $db;
    private bool $log_api_requests;
    private bool $log_chatgpt_usage;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->log_api_requests = ($_ENV['LOG_API_REQUESTS'] ?? 'true') === 'true';
        $this->log_chatgpt_usage = ($_ENV['LOG_CHATGPT_USAGE'] ?? 'true') === 'true';
    }

    /**
     * APIリクエストログの記録
     */
    public function logApiRequest(
        string $endpoint,
        string $method,
        ?array $request_data = null,
        ?array $response_data = null,
        int $response_status = 200,
        float $execution_time = 0.0,
        ?string $error_message = null
    ): void {
        if (!$this->log_api_requests) {
            return;
        }

        try {
            $sql = "INSERT INTO api_logs (
                endpoint, http_method, request_data, response_data,
                response_status, execution_time, user_agent, ip_address, error_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $params = [
                $endpoint,
                $method,
                $request_data ? json_encode($request_data, JSON_UNESCAPED_UNICODE) : null,
                $response_data ? json_encode($response_data, JSON_UNESCAPED_UNICODE) : null,
                $response_status,
                $execution_time,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $this->getClientIp(),
                $error_message
            ];

            $this->db->query($sql, $params);
        } catch (\Exception $e) {
            // ログ記録でエラーが発生してもアプリケーションの動作は継続
            error_log("Failed to log API request: " . $e->getMessage());
        }
    }

    /**
     * ChatGPT使用ログの記録
     */
    public function logChatGptUsage(
        ?int $company_id,
        ?int $template_id,
        string $prompt_text,
        ?string $response_text = null,
        int $tokens_used = 0,
        string $model_version = '',
        float $cost_usd = 0.0,
        float $response_time = 0.0,
        string $status = 'success',
        ?string $error_message = null
    ): int {
        if (!$this->log_chatgpt_usage) {
            return 0;
        }

        try {
            $sql = "INSERT INTO chatgpt_logs (
                company_id, template_id, prompt_text, response_text,
                tokens_used, model_version, cost_usd, response_time,
                status, error_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $params = [
                $company_id,
                $template_id,
                $prompt_text,
                $response_text,
                $tokens_used,
                $model_version,
                $cost_usd,
                $response_time,
                $status,
                $error_message
            ];

            return $this->db->insert($sql, $params);
        } catch (\Exception $e) {
            error_log("Failed to log ChatGPT usage: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * 送信履歴ログの記録
     */
    public function logSendHistory(array $data): int
    {
        try {
            $sql = "INSERT INTO send_history (
                company_id, message_subject, message_content, sender_name,
                sender_email, sender_company, sender_phone, response_status,
                response_message, http_status_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $params = [
                $data['company_id'],
                $data['message_subject'] ?? null,
                $data['message_content'] ?? null,
                $data['sender_name'] ?? null,
                $data['sender_email'] ?? null,
                $data['sender_company'] ?? null,
                $data['sender_phone'] ?? null,
                $data['response_status'] ?? 'pending',
                $data['response_message'] ?? null,
                $data['http_status_code'] ?? null
            ];

            return $this->db->insert($sql, $params);
        } catch (\Exception $e) {
            error_log("Failed to log send history: " . $e->getMessage());
            throw new \Exception("送信履歴の記録に失敗しました", 500);
        }
    }

    /**
     * システムログの記録
     */
    public function log(string $level, string $message, array $context = []): void
    {
        $log_level = $_ENV['LOG_LEVEL'] ?? 'info';
        $levels = ['debug' => 0, 'info' => 1, 'warning' => 2, 'error' => 3];

        if (!isset($levels[$level]) || !isset($levels[$log_level])) {
            return;
        }

        if ($levels[$level] < $levels[$log_level]) {
            return;
        }

        $timestamp = date('Y-m-d H:i:s');
        $context_str = !empty($context) ? ' ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';
        $log_entry = "[$timestamp] [$level] $message$context_str" . PHP_EOL;

        error_log($log_entry, 3, $this->getLogFilePath($level));
    }

    /**
     * デバッグログ
     */
    public function debug(string $message, array $context = []): void
    {
        $this->log('debug', $message, $context);
    }

    /**
     * 情報ログ
     */
    public function info(string $message, array $context = []): void
    {
        $this->log('info', $message, $context);
    }

    /**
     * 警告ログ
     */
    public function warning(string $message, array $context = []): void
    {
        $this->log('warning', $message, $context);
    }

    /**
     * エラーログ
     */
    public function error(string $message, array $context = []): void
    {
        $this->log('error', $message, $context);
    }

    /**
     * ログファイルパスの取得
     */
    private function getLogFilePath(string $level): string
    {
        $log_dir = dirname(__DIR__) . '/logs';
        if (!is_dir($log_dir)) {
            mkdir($log_dir, 0755, true);
        }

        $date = date('Y-m-d');
        return "$log_dir/{$level}_{$date}.log";
    }

    /**
     * クライアントIPアドレスの取得
     */
    private function getClientIp(): string
    {
        $ip_headers = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR'
        ];

        foreach ($ip_headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                return trim($ips[0]);
            }
        }

        return 'unknown';
    }

    /**
     * ログの削除（古いログのクリーンアップ）
     */
    public function cleanupLogs(int $retention_days = 30): int
    {
        $deleted_count = 0;

        try {
            // APIログの削除
            $sql = "DELETE FROM api_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
            $deleted_count += $this->db->execute($sql, [$retention_days]);

            // ChatGPTログの削除（コスト管理のため少し長めに保持）
            $chatgpt_retention = max($retention_days, 90);
            $sql = "DELETE FROM chatgpt_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
            $deleted_count += $this->db->execute($sql, [$chatgpt_retention]);

        } catch (\Exception $e) {
            error_log("Failed to cleanup logs: " . $e->getMessage());
        }

        return $deleted_count;
    }
}