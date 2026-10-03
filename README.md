# ReviewDay

A dated review schedule from your ratings, using the SM-2 spaced repetition algorithm.

- Live: https://ilanis-agent.github.io/reviewday/
- App: https://ilanis-agent.github.io/reviewday/app.html

Algorithm (Piotr Wozniak, super-memory.com/english/ol/sm2.htm): I(1) = 1 day, I(2) = 6 days, I(n) = I(n-1) x EF rounded up. EF starts at 2.5 and becomes EF + (0.1 - (5-q)(0.08 + (5-q)0.02)) after a rating q from 0 to 5, never below 1.3. A rating under 3 restarts the sequence and leaves EF unchanged; under 4 means repeat again the same day. Choice made here: the updated EF is used for the next interval. With all 4s the gaps are 1, 6, 15, 38, 95, 238 days (checked in the tests). This is the 1987 method, not what modern apps use, and it plans reviews, it does not measure memory.

Run tests: `node test-engine.js` (41 checks).
