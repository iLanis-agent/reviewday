var R = require('./engine.js'), pass = 0, fail = 0;
function eq(n, a, b, t) { if (a !== null && a !== undefined && Math.abs(a - b) <= (t || 1e-9)) pass++; else { fail++; console.log('FAIL', n, a, b); } }
function ok(n, c) { if (c) pass++; else { fail++; console.log('FAIL', n); } }
// E-factor changes from the SM-2 formula
eq('q5', R.efDelta(5), 0.1); eq('q4', R.efDelta(4), 0); eq('q3', R.efDelta(3), -0.14); eq('q2', R.efDelta(2), -0.32); eq('q1', R.efDelta(1), -0.54); eq('q0', R.efDelta(0), -0.8);
// the two printed forms agree for every q (EF - 0.8 + 0.28q - 0.02q^2)
for (var q = 0; q <= 5; q++) eq('alt form ' + q, R.efDelta(q), -0.8 + 0.28 * q - 0.02 * q * q);
// all 4s: 1, 6, 15, 38, 95, 238 days (EF stays 2.5, rounded up)
var st = { n: 0, ef: 2.5, interval: 0 }, got = [];
for (var i = 0; i < 6; i++) { st = R.step(st, 4); got.push(st.interval); }
ok('all 4 intervals ' + got, got.join() === '1,6,15,38,95,238');
// all 5s: EF rises 0.1 each repetition: 2.6, 2.7, 2.8
st = { n: 0, ef: 2.5, interval: 0 }; st = R.step(st, 5); st = R.step(st, 5); var s3 = R.step(st, 5);
eq('ef after 3 fives', s3.ef, 2.8); eq('third interval', s3.interval, Math.ceil(6 * 2.8));
// all 3s: EF 2.36, 2.22, 2.08
st = { n: 0, ef: 2.5, interval: 0 }; st = R.step(st, 3); st = R.step(st, 3); s3 = R.step(st, 3);
eq('ef after 3 threes', s3.ef, 2.08); eq('third interval 3s', s3.interval, Math.ceil(6 * 2.08));
// EF floor
st = { n: 5, ef: 1.35, interval: 20 }; var f = R.step(st, 3); eq('ef floor', f.ef, 1.3);
// q < 3 restarts without changing EF
st = { n: 4, ef: 2.2, interval: 40 }; var r = R.step(st, 2); ok('reset flag', r.reset === true); eq('reset ef unchanged', r.ef, 2.2); ok('reset interval 1', r.interval === 1 && r.n === 1);
// again today if q < 4
ok('q3 again', R.step({ n: 0, ef: 2.5, interval: 0 }, 3).again === true); ok('q4 no again', R.step({ n: 0, ef: 2.5, interval: 0 }, 4).again === false);
ok('bad q', R.step({ n: 0, ef: 2.5, interval: 0 }, 6) === null && R.step({ n: 0, ef: 2.5, interval: 0 }, 2.5) === null);
// schedule dates: sessions on day 0, 1, 7, 22 (all 4s), next review day 60
var s = R.schedule('2026-10-03', [4, 4, 4, 4]);
ok('dates', s.rows.map(function (x) { return x.date; }).join() === '2026-10-03,2026-10-04,2026-10-10,2026-10-25');
ok('next date', s.nextDate === '2026-12-02'); eq('next day', s.nextDay, 60); eq('next interval', s.nextInterval, 38);
ok('first row is learning', s.rows[0].session === 0 && s.rows[0].nextInterval === 1);
// month and year rollover
ok('add days', R.addDays('2026-12-31', 1) === '2027-01-01'); ok('leap', R.addDays('2028-02-28', 1) === '2028-02-29'); ok('bad date', R.addDays('2026-13-40', 1) === null && R.addDays('x', 1) === null);
// failing resets the schedule: 4,4,4 then 1 on day 22 resets to 1 day, then a 4 gives 6
var s2 = R.schedule('2026-10-03', [4, 4, 4, 1, 4, 4]);
ok('fail row resets', s2.rows[3].reset === true && s2.rows[3].nextInterval === 1 && s2.rows[3].ef === 2.5);
ok('then 1 day later', s2.rows[4].day === s2.rows[3].day + 1); ok('then 6 days', s2.rows[4].nextInterval === 6 && s2.rows[5].day === s2.rows[4].day + 6 && s2.nextInterval === 15);
ok('empty', R.schedule('2026-10-03', []) === null); ok('too long', R.schedule('2026-10-03', new Array(41).fill(4)) === null);
ok('bad start', R.schedule('nope', [4]) === null); ok('bad q', R.schedule('2026-10-03', [4, 9]) === null);
// parse
ok('parse', R.parse('4, 5 3').join() === '4,5,3'); ok('parse bad', R.parse('4 9') === null);
console.log(pass + '/' + (pass + fail) + ' pass'); process.exit(fail ? 1 : 0);
