export const causeDelay = async (delayTime) => {
  const causeDelayPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delayTime);
  });
  return await causeDelayPromise;
};
