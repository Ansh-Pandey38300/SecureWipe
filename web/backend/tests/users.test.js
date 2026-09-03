const app = require("../app");
const request = require("supertest");

const User = require("../models/User");
const argon2 = require("argon2");

describe("USERS API", () => {

    let adminToken;
    let customerToken;

    let adminId;
    let testUserId;

    const admin = {
        name: "Test Admin",
        email: `admin-${Date.now()}@gmail.com`,
        password: "Admin@12345"
    };

    const customer = {
        name: "Test Customer",
        email: `customer-${Date.now()}@gmail.com`,
        password: "Customer@12345"
    };


     
    // SETUP
     

    beforeAll(async () => {

        // --------------------------------------
        // Create ADMIN
        // --------------------------------------

        const adminUser = await User.create({
            name: admin.name,
            email: admin.email,
            passwordHash: await argon2.hash(admin.password),
            role: "ADMIN",
            status: "ACTIVE"
        });

        adminId = adminUser._id.toString();


        // --------------------------------------
        // Create CUSTOMER
        // --------------------------------------

        await User.create({
            name: customer.name,
            email: customer.email,
            passwordHash: await argon2.hash(customer.password),
            role: "CUSTOMER",
            status: "ACTIVE"
        });


        // --------------------------------------
        // Create another user for role testing
        // --------------------------------------

        const testUser = await User.create({
            name: "Role Test User",
            email: `role-test-${Date.now()}@gmail.com`,
            passwordHash: await argon2.hash("Test@12345"),
            role: "CUSTOMER",
            status: "ACTIVE"
        });

        testUserId = testUser._id.toString();


        // --------------------------------------
        // Login ADMIN
        // --------------------------------------

        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: admin.email,
                password: admin.password
            });

        expect(adminLogin.statusCode).toBe(200);

        adminToken = adminLogin.body.token;

        expect(adminToken).toBeDefined();


        // --------------------------------------
        // Login CUSTOMER
        // --------------------------------------

        const customerLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: customer.email,
                password: customer.password
            });

        expect(customerLogin.statusCode).toBe(200);

        customerToken = customerLogin.body.token;

        expect(customerToken).toBeDefined();
    });


     
    // 1. GET ALL USERS
     

    test("Admin should be able to get all users", async () => {

        const response = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(Array.isArray(response.body.data))
            .toBe(true);
    });


     
    // 2. NON-ADMIN GET ALL USERS
     

    test("Non-admin should not be able to get all users", async () => {

        const response = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${customerToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("Access denied");
    });


     
    // 3. UPDATE USER ROLE
     

    test("Admin should be able to update user role", async () => {

        const response = await request(app)
            .patch(`/api/users/${testUserId}/role`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                role: "WORKSTATION_EMPLOYEE"
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message)
            .toBe("User role updated successfully");

        expect(response.body.data.role)
            .toBe("WORKSTATION_EMPLOYEE");
    });


     
    // 4. INVALID ROLE
     

    test("Admin should not be able to assign an invalid role", async () => {

        const response = await request(app)
            .patch(`/api/users/${testUserId}/role`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                role: "SUPER_ADMIN"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("Invalid role assignment");
    });


     
    // 5. NORMAL USER CANNOT BECOME ADMIN
     

    test("Normal user should not be assigned ADMIN role", async () => {

        const response = await request(app)
            .patch(`/api/users/${testUserId}/role`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                role: "ADMIN"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("Invalid role assignment");
    });


     
    // 6. EXISTING ADMIN ROLE CANNOT BE CHANGED
     

    test("Existing ADMIN role should not be changed", async () => {

        const response = await request(app)
            .patch(`/api/users/${adminId}/role`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                role: "CUSTOMER"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("Admin role cannot be changed");
    });


     
    // 7. NON-ADMIN UPDATE ROLE
     

    test("Non-admin should not be able to update user role", async () => {

        const response = await request(app)
            .patch(`/api/users/${testUserId}/role`)
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                role: "WORKSTATION_HEAD"
            });

        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("Access denied");
    });


     
    // 8. ELIGIBLE WORKSTATION HEADS
     

    test("Admin should be able to get eligible workstation heads", async () => {

        const response = await request(app)
            .get("/api/users/eligible-center-heads")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(Array.isArray(response.body.data))
            .toBe(true);
    });


     
    // 9. NON-ADMIN ELIGIBLE HEADS
     

    test("Non-admin should not be able to get eligible workstation heads", async () => {

        const response = await request(app)
            .get("/api/users/eligible-center-heads")
            .set("Authorization", `Bearer ${customerToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("Access denied");
    });

});