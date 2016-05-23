// See: https://github.com/chenglou/react-motion/blob/dafff3f2b00ac11f39d91f3363cc97de664b2406/test/createMockRaf.js
// See: https://github.com/chenglou/react-motion/blob/master/test/createMockRaf.js
// See: https://github.com/FormidableLabs/mock-raf
// See: https://github.com/lukastaegert/mock-raf
// See: https://gist.github.com/ischenkodv/43934774f4509fcb5791

export default function() {
  let allCallbacks = [];
  let prevTime = 0;
  let id = 0;

  const now = () => prevTime;

  const raf = cb => {
    id++;
    allCallbacks.push({id, cb});
    return id;
  };

  raf.cancel = id2 => {
    allCallbacks = allCallbacks.filter(item => item.id !== id2);
  };

  const defaultTimeInterval = 1000 / 60;

  const _step = ms => {
    const allCallbacksBefore = allCallbacks;
    allCallbacks = [];
    prevTime += ms;
    allCallbacksBefore.forEach(({cb}) => cb(prevTime));
  };

  const step = (howMany = 1, ms = defaultTimeInterval) => {
    for (let i = 0; i < howMany; i++) {
      _step(ms);
    }
  };

  return {now, raf, step};
};
