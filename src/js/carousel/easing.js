// See: http://robertpenner.com/easing/


export const easeInOutQuad = (t, b, c, d) => {
  t /= d / 2;
  if(t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};

export const inOutQuintic = (t, b, c, d) => {
  const ts = (t/=d)*t;
  const tc = ts*t;
  return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
};
