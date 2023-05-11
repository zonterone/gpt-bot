export const isToBotMessage = (value: string) => {
  const regexp = /^\!/;
  return regexp.exec(value);
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.round(Math.random() * (max - min) + min);
};

export const getWaitingMessagesClosure = () => {
  let prevIdx: number | null = null;
  const getWaitingMessages = (): string => {
    const messages = [
      "Секретные данные переносим в защищенное место…",
      "Производим сложные расчеты… Надеемся, они верны!",
      "Немного передышки для нашей героической команды…",
      "Солнце светит, птицы поют, а мы все еще работаем над этим ответом…",
      "Генерируем случайные числа. Иногда они бывают правдоподобными…",
      "Процесс генерации данных в самом разгаре. Никуда не уходите!",
      "Машины генерируют данные для нашего благополучия…",
      "Согласно нашим вычислениям, данные должны появиться через несколько секунд…",
      "Данные в пути…",
      "Генерируем информацию…",
      "Ищем нужные ответы…",
      "Тут у нас группа экспертов работает над ответом. Подождите…",
      "Загружено котят: 0/100. Пожалуйста, подождите…",
      "Вы думали, мы что-то типа Google? Нет, у нас работает один кролик на четырех колесах. Подождите…",
      "Наши серверы как бегемоты. Большие, медленные и любят воду. Подождите…",
      "Данные запускаются на поток. Поток падает. Мы начинаем с начала…",
    ];
    const randomNumber = getRandomNumber(0, messages.length - 1);
    if (prevIdx === randomNumber) {
      return getWaitingMessages();
    } else {
      prevIdx = randomNumber;
      return messages[randomNumber];
    }
  };
  return getWaitingMessages;
};

export const defaultPrompt = "You are helpful assistant. First find relevant information, then answer the question based on the relevant information. Your answer should not contain more than 400 words"