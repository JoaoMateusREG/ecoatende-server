import axios from 'axios';

export function SendMessage(tittle: string, message: string, priority: string) {
  const url =
    process.env.URL_PUSH_NOTIFICATION +
    '?token=' +
    process.env.TOKEN_PUSH_NOTIFICATION;

  const formData = new FormData();
  formData.append('title', tittle);
  formData.append('message', message);
  formData.append('priority', priority);

  axios
    .post(url!, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .catch((error) => {
      console.error('Erro ao enviar mensagem:', error);
    });
}
