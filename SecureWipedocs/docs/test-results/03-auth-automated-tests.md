# Test Log — Automated Auth API Tests (Jest + Supertest)

Added an automated suite covering registration, login, `/me`, wrong-password rejection, missing-token rejection, and invalid-token rejection, running against a dedicated MongoDB test database (MONGO_TEST_URI) rather than production. All six cases pass.

Initial run failed with a MongoDB "buffering timed out" error — turned out the tests were pointing at the wrong database URI. Fixed by wiring up the dedicated test URI plus proper connection setup/teardown for Jest.

Evidence:Manual[Screenshots not given]
Screenshot (Jest output):SS-TEST-01-jest-auth-results
