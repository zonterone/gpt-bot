export const isToBotMessage = (value: string) => {
  const regexp = /^\//;
  return regexp.exec(value);
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.round(Math.random() * (max - min) + min);
};

export const getWaitingMessagesClosure = () => {
  let prevIdx: number | null = null;
  const getWaitingMessages = (): string => {
    const messages = [
      "We're transferring sensitive data to a secure location...",
      "Making complicated calculations... We hope they're correct!",
      "A little respite for our heroic team...",
      "The sun is shining, the birds are singing, and we're still working on this answer...",
      "Generate random numbers. Sometimes they are plausible...",
      "The data generation process is in full swing. Don't go anywhere!",
      "Machines generate data for our well-being...",
      "According to our calculations, the data should appear in a few seconds... Data on the way…",
      "Generating information…",
      "Looking for the right answers…",
      "Here we have a group of experts working on the answer. Wait…",
      "Uploaded kittens: 0/100. Please wait…",
      "You thought we were some kind of Google? No, we have one rabbit running on four wheels. Wait…",
      "Our servers are like behemoths. Big, slow and love water. Wait…",
      "Data starts streaming. Stream drops. We're starting from the beginning...",
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

export const defaultPrompt =
  "You are helpful assistant. First find relevant information, then answer the question based on the relevant information. Your answer should not contain more than 200 words";
