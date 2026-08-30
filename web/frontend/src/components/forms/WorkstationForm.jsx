import { useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";

function WorkstationForm({
    onSubmit,
    workstationCenterId,
    submitting = false
}) {
    const [name, setName] = useState("");
    const [status, setStatus] = useState("ACTIVE");

    const handleSubmit = async (event) => {
        event.preventDefault();

        await onSubmit({
            name: name.trim(),
            status,
        });

        setName("");
        setStatus("ACTIVE");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                id="workstation-name"
                label="Workstation Name"
                value={name}
                onChange={(event) =>
                    setName(event.target.value)
                }
                placeholder="Enter workstation name"
                required
            />

            <div className="space-y-2">
                <label
                    htmlFor="workstation-status"
                    className="block text-sm font-medium text-slate-700"
                >
                    Status
                </label>

                <select
                    id="workstation-status"
                    value={status}
                    onChange={(event) =>
                        setStatus(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="ACTIVE">
                        ACTIVE
                    </option>

                    <option value="INACTIVE">
                        INACTIVE
                    </option>

                    <option value="MAINTENANCE">
                        MAINTENANCE
                    </option>
                </select>
            </div>

            <Button
                type="submit"
                disabled={submitting || !workstationCenterId}
            >
                {submitting
                    ? "Creating..."
                    : "Create Workstation"}
            </Button>
        </form>
    );
}

export default WorkstationForm;