const app = require("../app");
const request = require("supertest");

describe("AUTH API", () => {

    const user = {
        name: "Test User",
        email: `test-${Date.now()}@gmail.com`,
        password: "jayanta70"
    };

    let token;


    // 1. REGISTER
    test("User should be registered successfully", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send(user);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message)
            .toBe("User registered successfully");
    });


    // 2. LOGIN
    test("Registered user should be logged in successfully", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: user.email,
                password: user.password
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message)
            .toBe("User logged in successfully");

        expect(response.body.token).toBeDefined();

        token = response.body.token;
    });


    // 3. GET /ME
    test("Authenticated user should be able to access /me", async () => {

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user.email)
            .toBe(user.email);
    });


    // 4. WRONG PASSWORD
    test("Login should reject wrong password", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: user.email,
                password: "WrongPassword123"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });


    // 5. MISSING TOKEN
    test("Protected route should reject missing token", async () => {

        const response = await request(app)
            .get("/api/auth/me");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });


    // 6. INVALID TOKEN
    test("Protected route should reject invalid token", async () => {

        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                "Bearer invalid-token"
            );

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

});