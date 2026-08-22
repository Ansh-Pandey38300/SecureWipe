const app = require("../app");
const request = require("supertest");

const User = require("../models/User");
const WorkstationCenter = require("../models/WorkstationCenter");

const argon2 = require("argon2");

describe("WORKSTATION CENTER API", () => {

    let adminToken;
    let headToken;
    let customerToken;

    let adminId;
    let headId;
    let customerId;

    let employee1Id;
    let employee2Id;

    let centerId;
    let centerMongoId;


    // ==================================================
    // SETUP
    // ==================================================

    beforeAll(async () => {

        // ----------------------------------------------
        // 1. CREATE ADMIN
        // ----------------------------------------------

        const admin = await User.create({
            name: "Test Admin",
            email: `admin-ws-${Date.now()}@gmail.com`,
            passwordHash: await argon2.hash("Admin@12345"),
            role: "ADMIN",
            status: "ACTIVE"
        });

        adminId = admin._id.toString();


        // ----------------------------------------------
        // 2. CREATE WORKSTATION HEAD
        // ----------------------------------------------

        const head = await User.create({
            name: "Test Workstation Head",
            email: `head-ws-${Date.now()}@gmail.com`,
            passwordHash: await argon2.hash("Head@12345"),
            role: "WORKSTATION_HEAD",
            status: "ACTIVE"
        });

        headId = head._id.toString();


        // ----------------------------------------------
        // 3. CREATE CUSTOMER
        // ----------------------------------------------

        const customer = await User.create({
            name: "Test Customer",
            email: `customer-ws-${Date.now()}@gmail.com`,
            passwordHash: await argon2.hash("Customer@12345"),
            role: "CUSTOMER",
            status: "ACTIVE"
        });

        customerId = customer._id.toString();


        // ----------------------------------------------
        // 4. CREATE EMPLOYEE 1
        // ----------------------------------------------

        const employee1 = await User.create({
            name: "Test Employee One",
            email: `employee1-${Date.now()}@gmail.com`,
            passwordHash: await argon2.hash("Employee@12345"),
            role: "WORKSTATION_EMPLOYEE",
            status: "ACTIVE"
        });

        employee1Id = employee1._id.toString();


        // ----------------------------------------------
        // 5. CREATE EMPLOYEE 2
        // ----------------------------------------------

        const employee2 = await User.create({
            name: "Test Employee Two",
            email: `employee2-${Date.now()}@gmail.com`,
            passwordHash: await argon2.hash("Employee@12345"),
            role: "WORKSTATION_EMPLOYEE",
            status: "ACTIVE"
        });

        employee2Id = employee2._id.toString();


        // ==================================================
        // LOGIN
        // ==================================================

        // ----------------------------------------------
        // ADMIN LOGIN
        // ----------------------------------------------

        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: admin.email,
                password: "Admin@12345"
            });

        expect(adminLogin.statusCode).toBe(200);

        adminToken = adminLogin.body.token;

        expect(adminToken).toBeDefined();


        // ----------------------------------------------
        // WORKSTATION HEAD LOGIN
        // ----------------------------------------------

        const headLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: head.email,
                password: "Head@12345"
            });

        expect(headLogin.statusCode).toBe(200);

        headToken = headLogin.body.token;

        expect(headToken).toBeDefined();


        // ----------------------------------------------
        // CUSTOMER LOGIN
        // ----------------------------------------------

        const customerLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: customer.email,
                password: "Customer@12345"
            });

        expect(customerLogin.statusCode).toBe(200);

        customerToken = customerLogin.body.token;

        expect(customerToken).toBeDefined();
    });


    // ==================================================
    // 1. CREATE WORKSTATION CENTER
    // ==================================================

    test("Admin should be able to create workstation center", async () => {

        const response = await request(app)
            .post("/api/workstation-centers")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: `Test Center ${Date.now()}`,

                head: headId,

                location: {
                    address: "JNU Campus",
                    city: "New Delhi",
                    state: "Delhi",
                    postalCode: "110067",
                    country: "India"
                },

                status: "ACTIVE"
            });


        expect(response.statusCode).toBe(201);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toBeDefined();

        expect(response.body.data.centerId).toBeDefined();

        expect(response.body.data.name).toBeDefined();

        /*
         * head is an ObjectId in MongoDB.
         * After JSON serialization it becomes a string.
         */
        expect(response.body.data.head.toString())
            .toBe(headId);


        // Save custom centerId for API calls
        centerId = response.body.data.centerId;


        // Save MongoDB _id for database verification
        centerMongoId = response.body.data._id;
    });


    // ==================================================
    // 2. VERIFY CENTER CREATED IN DATABASE
    // ==================================================

    test("Created workstation center should exist in database", async () => {

        const center = await WorkstationCenter.findOne({
            centerId: centerId
        });

        expect(center).not.toBeNull();

        expect(center.name).toBeDefined();

        expect(center.head.toString())
            .toBe(headId);

        expect(center.status)
            .toBe("ACTIVE");

        expect(center._id.toString())
            .toBe(centerMongoId);
    });


    // ==================================================
    // 3. NON-ADMIN CANNOT CREATE CENTER
    // ==================================================

    test("Non-admin should not be able to create workstation center", async () => {

        const response = await request(app)
            .post("/api/workstation-centers")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                name: `Unauthorized Center ${Date.now()}`,

                head: headId,

                location: {
                    address: "JNU",
                    city: "New Delhi",
                    state: "Delhi",
                    postalCode: "110067",
                    country: "India"
                },

                status: "ACTIVE"
            });


        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);
    });


    // ==================================================
    // 4. ADMIN GET CENTER
    // ==================================================

    test("Admin should be able to get workstation center", async () => {

        const response = await request(app)
            .get(`/api/workstation-centers/${centerId}`)
            .set("Authorization", `Bearer ${adminToken}`);


        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data.centerId)
            .toBe(centerId);

        expect(response.body.data.name)
            .toBeDefined();

        expect(response.body.data.location)
            .toBeDefined();

        expect(response.body.data.status)
            .toBe("ACTIVE");

        expect(response.body.data.head)
            .toBeDefined();

        expect(response.body.data.head._id)
            .toBe(headId);

        expect(response.body.data.employees)
            .toBeDefined();

        expect(Array.isArray(response.body.data.employees))
            .toBe(true);
    });


    // ==================================================
    // 5. WORKSTATION HEAD CAN ACCESS OWN CENTER
    // ==================================================

    test("Workstation head should be able to access own center", async () => {

        const response = await request(app)
            .get(`/api/workstation-centers/${centerId}`)
            .set("Authorization", `Bearer ${headToken}`);


        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data.centerId)
            .toBe(centerId);

        expect(response.body.data.name)
            .toBeDefined();

        expect(response.body.data.location)
            .toBeDefined();

        expect(response.body.data.status)
            .toBe("ACTIVE");

        expect(response.body.data.employees)
            .toBeDefined();

        /*
         * Workstation head response does not contain head,
         * according to your service.
         */
        expect(response.body.data.head)
            .toBeUndefined();
    });


    // ==================================================
    // 6. CUSTOMER CAN ACCESS CENTER
    // ==================================================

    test("Customer should be able to view workstation center", async () => {

        const response = await request(app)
            .get(`/api/workstation-centers/${centerId}`)
            .set("Authorization", `Bearer ${customerToken}`);


        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data.centerId)
            .toBe(centerId);

        expect(response.body.data.name)
            .toBeDefined();

        expect(response.body.data.location)
            .toBeDefined();

        expect(response.body.data.status)
            .toBe("ACTIVE");

        expect(response.body.data.head)
            .toBeDefined();

        expect(response.body.data.head.name)
            .toBeDefined();

        /*
         * Customer should only receive head.name,
         * not the complete head object.
         */
        expect(response.body.data.head.email)
            .toBeUndefined();
    });


    // ==================================================
    // 7. ASSIGN EMPLOYEES
    // ==================================================

    test("Admin should be able to assign employees", async () => {

        const response = await request(app)
            .post(`/api/workstation-centers/${centerId}/employees`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                employeesIds: [
                    employee1Id,
                    employee2Id
                ]
            });


        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message)
            .toBe("Employee assigned successfully");

        expect(response.body.data)
            .toBeDefined();

        expect(response.body.data.employees)
            .toBeDefined();


        /*
         * The service pushes ObjectIds.
         * JSON converts them to strings.
         */
        const assignedEmployees =
            response.body.data.employees.map(
                employee => employee.toString()
            );


        expect(assignedEmployees)
            .toEqual(
                expect.arrayContaining([
                    employee1Id,
                    employee2Id
                ])
            );
    });


    // ==================================================
    // 8. VERIFY CENTER EMPLOYEES IN DATABASE
    // ==================================================

    test("Assigned employees should exist in workstation center", async () => {

        const center = await WorkstationCenter.findOne({
            centerId: centerId
        });


        expect(center).not.toBeNull();

        const employeeIds =
            center.employees.map(
                employee => employee.toString()
            );


        expect(employeeIds)
            .toEqual(
                expect.arrayContaining([
                    employee1Id,
                    employee2Id
                ])
            );
    });


    // ==================================================
    // 9. VERIFY USER WORKSTATION CENTER
    // ==================================================

    test("Assigned employees should have workstationCenter set", async () => {

        const employee1 =
            await User.findById(employee1Id);

        const employee2 =
            await User.findById(employee2Id);


        expect(employee1).not.toBeNull();

        expect(employee2).not.toBeNull();


        expect(employee1.workstationCenter)
            .toBeDefined();

        expect(employee2.workstationCenter)
            .toBeDefined();


        expect(employee1.workstationCenter.toString())
            .toBe(centerMongoId);

        expect(employee2.workstationCenter.toString())
            .toBe(centerMongoId);
    });


    // ==================================================
    // 10. VERIFY POPULATED EMPLOYEES
    // ==================================================

    test("Center should return populated assigned employees", async () => {

        const response = await request(app)
            .get(`/api/workstation-centers/${centerId}`)
            .set("Authorization", `Bearer ${adminToken}`);


        expect(response.statusCode).toBe(200);

        expect(response.body.data.employees)
            .toBeDefined();


        expect(response.body.data.employees)
            .toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: employee1Id,
                        name: "Test Employee One",
                        role: "WORKSTATION_EMPLOYEE",
                        status: "ACTIVE"
                    }),

                    expect.objectContaining({
                        _id: employee2Id,
                        name: "Test Employee Two",
                        role: "WORKSTATION_EMPLOYEE",
                        status: "ACTIVE"
                    })
                ])
            );
    });


    // ==================================================
    // 11. DUPLICATE EMPLOYEE ASSIGNMENT
    // ==================================================

    test("Already assigned employee should not be assigned again", async () => {

        const response = await request(app)
            .post(`/api/workstation-centers/${centerId}/employees`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                employeesIds: [
                    employee1Id
                ]
            });


        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe(
                "One or more employees are already assigned to a workstation center"
            );
    });


    // ==================================================
    // 12. INVALID EMPLOYEE ROLE
    // ==================================================

    test("Non-workstation employee should not be assigned", async () => {

        const response = await request(app)
            .post(`/api/workstation-centers/${centerId}/employees`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                employeesIds: [
                    customerId
                ]
            });


        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe(
                "Only workstation employees can be assigned"
            );
    });


    // ==================================================
    // 13. CUSTOMER CANNOT ASSIGN EMPLOYEES
    // ==================================================

    test("Customer should not be able to assign employees", async () => {

        const response = await request(app)
            .post(`/api/workstation-centers/${centerId}/employees`)
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                employeesIds: [
                    customerId
                ]
            });


        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);
    });


    // ==================================================
    // 14. INVALID CENTER ID
    // ==================================================

    test("Non-existing workstation center should return 404", async () => {

        const response = await request(app)
            .get("/api/workstation-centers/non-existing-center-id")
            .set("Authorization", `Bearer ${adminToken}`);


        expect(response.statusCode).toBe(404);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("Workstation center does not exist");
    });


    // ==================================================
    // 15. WORKSTATION HEAD CANNOT ACCESS ANOTHER CENTER
    // ==================================================

    test("Workstation head should not access another user's center", async () => {

        /*
         * Create another workstation head.
         */

        const anotherHead = await User.create({
            name: "Another Workstation Head",
            email: `another-head-${Date.now()}@gmail.com`,
            passwordHash: await argon2.hash("Another@12345"),
            role: "WORKSTATION_HEAD",
            status: "ACTIVE"
        });


        /*
         * Login as another workstation head.
         */

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: anotherHead.email,
                password: "Another@12345"
            });


        expect(login.statusCode).toBe(200);

        const anotherHeadToken =
            login.body.token;


        /*
         * Try accessing the first head's center.
         */

        const response = await request(app)
            .get(`/api/workstation-centers/${centerId}`)
            .set(
                "Authorization",
                `Bearer ${anotherHeadToken}`
            );


        expect(response.statusCode).toBe(403);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe(
                "You are not authorized to access this workstation center"
            );
    });


    // ==================================================
    // 16. WORKSTATION HEAD CAN ASSIGN TO OWN CENTER
    // ==================================================

    test("Workstation head should be able to assign employees to own center", async () => {

        /*
         * Create a new employee.
         */

        const employee3 = await User.create({
            name: "Test Employee Three",
            email: `employee3-${Date.now()}@gmail.com`,
            passwordHash: await argon2.hash("Employee@12345"),
            role: "WORKSTATION_EMPLOYEE",
            status: "ACTIVE"
        });


        const employee3Id =
            employee3._id.toString();


        const response = await request(app)
            .post(`/api/workstation-centers/${centerId}/employees`)
            .set(
                "Authorization",
                `Bearer ${headToken}`
            )
            .send({
                employeesIds: [
                    employee3Id
                ]
            });


        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data.employees)
            .toBeDefined();


        /*
         * Verify DB relationship.
         */

        const updatedEmployee =
            await User.findById(employee3Id);


        expect(updatedEmployee.workstationCenter)
            .toBeDefined();

        expect(updatedEmployee.workstationCenter.toString())
            .toBe(centerMongoId);
    });


    // ==================================================
    // 17. EMPTY EMPLOYEE ARRAY
    // ==================================================

    test("Empty employeesIds array should be rejected", async () => {

        const response = await request(app)
            .post(`/api/workstation-centers/${centerId}/employees`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                employeesIds: []
            });


        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("At least one employee is required");
    });


    // ==================================================
    // 18. EMPLOYEES IDS MUST BE ARRAY
    // ==================================================

    test("employeesIds should be an array", async () => {

        const response = await request(app)
            .post(`/api/workstation-centers/${centerId}/employees`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                employeesIds: employee1Id
            });


        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.error.message)
            .toBe("At least one employee is required");
    });

});