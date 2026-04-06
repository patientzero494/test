/**
 * Telegram Bot API на Cloudflare Workers.
 * Любое входящее сообщение → ответ «привет».
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      return new Response(
        [
          "Worker запущен.",
          "",
          "Установите вебхук (подставьте URL после деплоя):",
          "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<test.patientzero494.workers.dev>.workers.dev",
          "",
          "Секрет BOT_TOKEN: wrangler secret put 8670249128:AAHTLB89_YZvU3zv6a9_TFiLjCgRBCphf6M",
        ].join("\n"),
        { headers: { "content-type": "text/plain; charset=utf-8" } }
      );
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const token = env.BOT_TOKEN;
    if (!token) {
      return new Response("BOT_TOKEN is not set", { status: 500 });
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return new Response("Bad JSON", { status: 400 });
    }

    const msg =
      update.message ||
      update.edited_message ||
      update.channel_post ||
      update.edited_channel_post;

    if (!msg?.chat?.id) {
      // Подтверждаем приём, чтобы Telegram не ретраил лишний раз
      return new Response("OK", { status: 200 });
    }

    const chatId = msg.chat.id;
    const api = `https://api.telegram.org/bot${token}/sendMessage`;

    ctx.waitUntil(
      fetch(api, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "привет",
        }),
      }).catch(() => {})
    );

    return new Response("OK", { status: 200 });
  },
};
