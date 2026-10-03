(function (root) {
  'use strict';
  // SM-2 algorithm, Piotr Wozniak (super-memory.com/english/ol/sm2.htm): I(1)=1, I(2)=6, I(n)=I(n-1)*EF rounded up,
  // EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02)), EF never below 1.3, start 2.5, q < 3 restarts the sequence with EF unchanged.
  var START_EF = 2.5, MIN_EF = 1.3;
  function efDelta(q) { return 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02); }
  function step(state, q) {
    if (!(q === 0 || q === 1 || q === 2 || q === 3 || q === 4 || q === 5)) return null;
    var ef = state.ef, n, interval;
    if (q < 3) { n = 1; interval = 1; }
    else {
      ef = Math.max(MIN_EF, ef + efDelta(q));
      n = state.n + 1;
      interval = n === 1 ? 1 : n === 2 ? 6 : Math.ceil(state.interval * ef - 1e-9);
    }
    return { n: n, ef: ef, interval: interval, again: q < 4, reset: q < 3 };
  }
  function addDays(iso, d) { var t = Date.parse(iso + 'T00:00:00Z'); if (isNaN(t)) return null; return new Date(t + d * 86400000).toISOString().slice(0, 10); }
  // The first rating is the learning session on the start date; each later rating is a review on its due date.
  function schedule(startIso, qualities) {
    if (addDays(startIso, 0) === null || !qualities.length || qualities.length > 40) return null;
    var st = { n: 0, ef: START_EF, interval: 0 }, day = 0, rows = [];
    for (var i = 0; i < qualities.length; i++) {
      var s = step(st, qualities[i]); if (!s) return null;
      rows.push({ session: i, date: addDays(startIso, day), day: day, q: qualities[i], ef: s.ef, nextInterval: s.interval, again: s.again, reset: s.reset });
      day += s.interval; st = s;
    }
    return { rows: rows, nextDate: addDays(startIso, day), nextDay: day, ef: st.ef, nextInterval: st.interval };
  }
  function parse(text) { var out = []; (text.match(/[0-9]/g) || []).forEach(function (c) { out.push(parseInt(c, 10)); }); return out.every(function (q) { return q <= 5; }) ? out : null; }
  root.ReviewDay = { START_EF: START_EF, MIN_EF: MIN_EF, efDelta: efDelta, step: step, addDays: addDays, schedule: schedule, parse: parse };
  if (typeof module !== 'undefined') module.exports = root.ReviewDay;
})(typeof window !== 'undefined' ? window : globalThis);
