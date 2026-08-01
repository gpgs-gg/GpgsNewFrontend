import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import { AsyncPaginate } from "react-select-async-paginate";

import { selectStyles } from "../../utils/selectStyles";
import { getUserDropdown, useUserDropdown } from "./services/index";

const UserFilter = ({
    isOpen,
    onClose,
    onApply,
    handleReset,
    resetTrigger,
}) => {

    const { data: dropdownData } = useUserDropdown({
        page: 1,
        limit: 10,
        search: "",
    });

    const roles = dropdownData?.roles || [];

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            userId: null,
            role: null,
            isActive: null,
        },
    });

    const loadUserOptions = async (search, loadedOptions, { page }) => {
        const res = await getUserDropdown({
            page,
            limit: 10,
            search,
        });

        return {
            options: res.data.map((item) => ({
                value: item._id,
                label: item.name,
                email: item.email,
            })),
            hasMore: res.hasMore,
            additional: {
                page: page + 1,
            },
        };
    };

    const roleOptions = useMemo(
        () =>
            roles.map((role) => ({
                value: role,
                label: role,
            })),
        [roles]
    );

    const statusOptions = [
        {
            value: true,
            label: "Active",
        },
        {
            value: false,
            label: "Inactive",
        },
    ];

    const onSubmit = (data) => {
        console.log("Filter", data)
        onApply({
            role: data.role?.value || "",
            userId: data.userId?.value || "",
            isActive:
                data.isActive === null
                    ? ""
                    : data.isActive.value,
        });

        onClose();
    };

    useEffect(() => {
        reset({
            userId: null,
            role: null,
            isActive: null,
        });
    }, [resetTrigger, reset]);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600">
                    <h2 className="font-bold text-lg">
                        Filters
                    </h2>

                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-5 space-y-5"
                >

                    {/* User */}

                    <Controller
                        name="userId"
                        control={control}
                        render={({ field }) => (
                            <div
                                className={`select-group ${
                                    field.value ? "has-value" : ""
                                }`}
                            >
                                <label className="select-label">
                                    User
                                </label>

                                <AsyncPaginate
                                    additional={{
                                        page: 1,
                                    }}
                                    debounceTimeout={500}
                                    isClearable
                                    placeholder=""
                                    loadOptions={loadUserOptions}
                                    styles={selectStyles}
                                    value={field.value}
                                    onChange={(option) =>
                                        field.onChange(option)
                                    }
                                />
                            </div>
                        )}
                    />

                    {/* Role */}

                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <div
                                className={`select-group ${
                                    field.value ? "has-value" : ""
                                }`}
                            >
                                <label className="select-label">
                                    Role
                                </label>

                                <Select
                                    options={roleOptions}
                                    isSearchable
                                    isClearable
                                    placeholder="Role"
                                    value={field.value}
                                    onChange={(option) =>
                                        field.onChange(option)
                                    }
                                    styles={selectStyles}
                                />
                            </div>
                        )}
                    />

                    {/* Status */}

                    <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                            <div
                                className={`select-group ${
                                    field.value ? "has-value" : ""
                                }`}
                            >
                                <label className="select-label">
                                    Status
                                </label>

                                <Select
                                    options={statusOptions}
                                    isSearchable
                                    isClearable
                                    placeholder="Status"
                                    value={field.value}
                                    onChange={(option) =>
                                        field.onChange(option)
                                    }
                                    styles={selectStyles}
                                />
                            </div>
                        )}
                    />

                    <div className="flex gap-3 pt-4">

                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full border border-gray-300 py-2 rounded-lg"
                        >
                            Reset
                        </button>

                        <button
                            type="submit"
                            className="w-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 text-white py-2 rounded-lg"
                        >
                            Apply Filters
                        </button>

                    </div>

                </form>
            </div>
        </>
    );
};

export default UserFilter;