import axios from 'axios';

export function SendMessage(title: string, message: string, priority: string) {
  const url =
    process.env.URL_PUSH_NOTIFICATION +
    '?token=' +
    process.env.TOKEN_PUSH_NOTIFICATION;

  axios
    .post(url!, { title, message, priority: Number(priority) }, {
      headers: { 'Content-Type': 'application/json' },
    })
    .catch((error) => {
      console.error('Erro ao enviar mensagem Gotify:', error?.response?.data ?? error.message);
    });
}
