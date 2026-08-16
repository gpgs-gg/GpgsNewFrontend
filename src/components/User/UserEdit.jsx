import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Eye, EyeOff, Save, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useUpdateUserData,
  useSingleUserData,
  // getEmployeeDropdown,
  // getBookingDropdown,
} from "./services";
import { selectStyles } from "../../utils/selectStyles";
import { toast } from "react-toastify";
import Loader from "../common/Loader";

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
  });

  const role = watch("role");

  const { mutate: updateUser, isPending: updateLoading } = useUpdateUserData();
  const { data: userData } = useSingleUserData(id);

  useEffect(() => {
    if (userData?.data) {
      reset({
        name: userData.data.name,
        email: userData.data.email,
        password: userData.data.password,
        role: userData.data.role,
        // bookingId: userData.data.bookingId
        //   ? {
        //     value: userData.data.bookingId._id,
        //     label: userData.data.bookingId.bookingId,
        //   }
        //   : null,
        // employeeId: userData.data.employeeId
        //   ? {
        //     value: userData.data.employeeId._id,
        //     label: userData.data.employeeId.employeeName,
        //   }
        //   : null,
        isActive: userData.data.isActive,
      });
    }
  }, [userData, reset]);
  // Api Hooks
  const RoleOptions = [
    { value: "Admin", label: "Admin" },
    { value: "Employee", label: "Employee" },
    { value: "Client", label: "Client" },
  ];
  const StatusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password || undefined, // password blank asel tar update karu naka
      role: data.role,
      isActive: data.isActive,
    };

    updateUser(
      {
        id,
        data: payload,
      },
      {
        onSuccess: (res) => {
          toast.dismiss()
          toast.success(res.message);
          navigate("/users");
        },
        onError: (err) => {
          toast.dismiss()
          toast.error(
            err?.response?.data?.message || "Update Failed"
          );
        },
      }
    );
  };



  const input =
    "w-full border border-gray-300 rounded-lg px-3 py-2 hover  focus:ring-2 focus:ring-gray-500 outline-none";
  return (
    <div className="space-y-5">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>


        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {isEdit ? "Update User" : "Create User"}
              </h1>
              <p className="text-sm text-gray-500">
                Manage user account details
              </p>
            </div>

            <div className="flex gap-3">
              <Link to="/users">
                <button className="border rounded-lg px-5 py-2 hover:bg-gray-100 flex items-center gap-2">

                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2"
                disabled={updateLoading}
              >


                {isEdit ? updateLoading ? <div className='flex justify-center items-center gap-2'><Loader /> Processing...</div> : "Update User" : ""}
              </button>

            </div>
          </div>
        </div>
        <div className="bg-white  rounded-xl shadow-sm">

          <div className=" px-6 py-4">
            <h2 className="text-lg font-semibold">
              User Details
            </h2>
          </div>

          <div className="p-6 grid md:grid-cols-4 gap-5">

            {/* Name */}

            <div className="form-group md:col-span-1">
              <input
                {...register("name", {
                  required: "Name is required",
                })}
                className="form-input"
                placeholder=" "
              />
              {/* {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )} */}
              <label className="form-label form-label required-label">Name</label>
            </div>

            {/* Email */}
            <div className="form-group md:col-span-1">
              <input
                {...register("email", {
                  required: "Email is required",
                })}
                className="form-input"
                placeholder=" "
              />
              {/* {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )} */}
              <label className="form-label form-label required-label">Email</label>
            </div>

            {/* Password */}

            <div className="form-group md:col-span-1 relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="form-input pr-10"
                placeholder=" "
              />

              <label className="form-label">
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

              {/* {errors.password && (
    <p className="text-red-500 text-sm mt-1">
      {errors.password.message}
    </p>
  )} */}
            </div>
            <Controller
              name="role"
              control={control}
              rules={{
                required: "Role is required",
              }}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label form-label required-label">Role</label>
                  <Select
                    {...field}
                    options={RoleOptions}
                    placeholder=""
                    isClearable
                    value={RoleOptions.find(
                      (x) => x.value === field.value
                    )}
                    onChange={(e) => field.onChange(e?.value)}
                    styles={selectStyles}
                  />
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Status */}

            <Controller
              name="isActive"
              control={control}
              rules={{
                validate: (value) =>
                  value !== undefined && value !== null || "Status is required",
              }}
              render={({ field }) => (
                <div className={`select-group ${field.value !== undefined && field.value !== null ? "has-value" : ""
                  }`}>
                  <label className="select-label form-label required-label">Status</label>
                  <Select
                    {...field}
                    options={StatusOptions}
                    placeholder=""
                    isClearable
                    value={StatusOptions.find(
                      (x) => x.value === field.value
                    )}
                    onChange={(selected) => {
                      console.log(selected);
                      field.onChange(selected?.value);
                    }}
                    styles={selectStyles}
                  />
                  {/* {errors.isActive && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.isActive .message}
                    </p>
                  )} */}
                </div>
              )}
            />

          </div>

        </div>

        {/* Role Assignment */}
        {/* {(role === "Employee" || role === "Client") && (
          <div className="bg-white border rounded-xl shadow-sm">

            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">
                Role Assignment
              </h2>
            </div>

            <div className="p-6">

              {role === "Employee" && (
                <Controller
                  control={control}
                  name="employeeId"
                  rules={{
                    required: "Employee is required",
                  }}
                  render={({ field }) => (
                    <div>

                      <label className="text-sm font-medium">
                        Employee
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        {...field}
                        placeholder="Select Employee"
                        // loadOptions={getEmployeeDropdown}
                        isClearable
                      />

                      <p className="text-red-500 text-xs mt-1">
                        {errors.employeeId?.message}
                      </p>

                    </div>
                  )}
                />
              )}

              {role === "Client" && (
                <Controller
                  control={control}
                  name="bookingId"
                  rules={{
                    required: "Booking is required",
                  }}
                  render={({ field }) => (
                    <div>

                      <label className="text-sm font-medium">
                        Booking
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        {...field}
                        placeholder="Select Booking"
                        // loadOptions={getBookingDropdown}
                        isClearable
                      />

                      <p className="text-red-500 text-xs mt-1">
                        {errors.bookingId?.message}
                      </p>

                    </div>
                  )}
                />
              )}

            </div>

          </div>
        )} */}

        {/* Footer Buttons */}

        <div className="  rounded-xl  px-6 py-4 flex justify-end gap-3">

          <Link to="/users">
            <button
              type="button"
              className="border rounded-lg px-5 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>
          </Link>

          <button
            type="submit"
            className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2"
            disabled={updateLoading}
          >
            {isEdit ? updateLoading ? <div className='flex justify-center items-center gap-2'><Loader /> Processing...</div> : "Update User" : ""}
          </button>

        </div>

      </form>

    </div>
  );
};

export default UserEdit;