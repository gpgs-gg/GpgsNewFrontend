import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingEnquiry = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        whatsappNumber: "",
        callingNumber: "",
        email: "",
        companyCollegeName: "",
        profile: "",
        joiningDate: null,
        fatherName: "",
        fatherContact: "",
        motherName: "",
        motherContact: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    // ==========================================
    // CAPITALIZE NAME
    // ==========================================

    const capitalizeName = (value) => {
        return value
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // ==========================================
    // VALIDATION
    // ==========================================

    const validate = () => {
        const newErrors = {};

        // ==============================
        // CLIENT NAME
        // ==============================
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Client Name is required";
        }

        // ==============================
        // WHATSAPP NUMBER
        // ==============================
        if (!formData.whatsappNumber.trim()) {
            newErrors.whatsappNumber =
                "WhatsApp Contact No. is required";
        } else if (!/^[0-9]{10}$/.test(formData.whatsappNumber)) {
            newErrors.whatsappNumber =
                "Enter valid 10 digit WhatsApp number";
        }

        // ==============================
        // CALLING NUMBER
        // ==============================
        if (!formData.callingNumber.trim()) {
            newErrors.callingNumber =
                "Calling Contact No. is required";
        } else if (!/^[0-9]{10}$/.test(formData.callingNumber)) {
            newErrors.callingNumber =
                "Enter valid 10 digit calling number";
        }

        // ==============================
        // EMAIL
        // ==============================
        if (!formData.email.trim()) {
            newErrors.email = "Email ID is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Enter valid email address";
        }

        // ==============================
        // COMPANY / COLLEGE
        // ==============================
        if (!formData.companyCollegeName.trim()) {
            newErrors.companyCollegeName =
                "Company / College Name is required";
        }

        // ==============================
        // PROFILE / OCCUPATION
        // ==============================
        if (!formData.profile.trim()) {
            newErrors.profile =
                "Profile / Occupation is required";
        }

        // ==============================
        // JOINING DATE
        // ==============================
        if (!formData.joiningDate) {
            newErrors.joiningDate =
                "Date of Joining at PG is required";
        }

        // ==============================
        // FATHER NAME
        // ==============================
        if (!formData.fatherName.trim()) {
            newErrors.fatherName =
                "Father Name is required";
        }

        // ==============================
        // FATHER CONTACT
        // ==============================
        if (!formData.fatherContact.trim()) {
            newErrors.fatherContact =
                "Father Contact No. is required";
        } else if (!/^[0-9]{10}$/.test(formData.fatherContact)) {
            newErrors.fatherContact =
                "Enter valid 10 digit father contact number";
        }

        // ==============================
        // MOTHER NAME
        // ==============================
        if (!formData.motherName.trim()) {
            newErrors.motherName =
                "Mother Name is required";
        }

        // ==============================
        // MOTHER CONTACT
        // ==============================
        if (!formData.motherContact.trim()) {
            newErrors.motherContact =
                "Mother Contact No. is required";
        } else if (!/^[0-9]{10}$/.test(formData.motherContact)) {
            newErrors.motherContact =
                "Enter valid 10 digit mother contact number";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await axios.post(
                "/api/booking-enquiries",
                {
                    ...formData,
                    joiningDate: formData.joiningDate,
                }
            );

            if (response.data.success) {
                setSubmitted(true);

                setFormData({
                    fullName: "",
                    whatsappNumber: "",
                    callingNumber: "",
                    email: "",
                    companyCollegeName: "",
                    profile: "",
                    joiningDate: null,
                    fatherName: "",
                    fatherContact: "",
                    motherName: "",
                    motherContact: "",
                });
            }
        } catch (error) {
            console.error("Booking enquiry error:", error);

            alert(
                error?.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==========================================
    // SUCCESS SCREEN
    // ==========================================

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">✓</div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        Booking Enquiry Submitted
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Thank you for providing your details.
                        Our GPGS team will contact you shortly
                        regarding your PG booking.
                    </p>

                    <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="px-6 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800"
                    >
                        Submit Another Enquiry
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // FORM
    // ==========================================

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">

                {/* HEADER */}

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Gopal's PG Booking Form
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Please provide your details to proceed
                        with your PG booking.
                    </p>
                </div>

                {/* FORM CARD */}

                <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">

                    <form onSubmit={handleSubmit}>

                        {/* ================= CLIENT DETAILS ================= */}

                        <h2 className="text-lg font-semibold text-gray-800 mb-5">
                            Client Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* FULL NAME */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client Name <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => {
                                        const value = capitalizeName(e.target.value);

                                        setFormData((prev) => ({
                                            ...prev,
                                            fullName: value,
                                        }));

                                        setErrors((prev) => ({
                                            ...prev,
                                            fullName: "",
                                        }));
                                    }}
                                    placeholder="Enter full name"
                                    className={`w-full border rounded-lg px-3 py-2.5 outline-none ${errors.fullName
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                />

                                {errors.fullName && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.fullName}
                                    </p>
                                )}
                            </div>

                            {/* WHATSAPP */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    WhatsApp Contact No.{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="tel"
                                    name="whatsappNumber"
                                    maxLength={10}
                                    value={formData.whatsappNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );

                                        setFormData((prev) => ({
                                            ...prev,
                                            whatsappNumber: value,
                                        }));

                                        setErrors((prev) => ({
                                            ...prev,
                                            whatsappNumber: "",
                                        }));
                                    }}
                                    placeholder="10 digit mobile number"
                                    className={`w-full border rounded-lg px-3 py-2.5 outline-none ${errors.whatsappNumber
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                />

                                {errors.whatsappNumber && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.whatsappNumber}
                                    </p>
                                )}
                            </div>

                            {/* CALLING */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Calling Contact No. <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="tel"
                                    name="callingNumber"
                                    maxLength={10}
                                    value={formData.callingNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );

                                        setFormData((prev) => ({
                                            ...prev,
                                            callingNumber: value,
                                        }));

                                        setErrors((prev) => ({
                                            ...prev,
                                            callingNumber: "",
                                        }));
                                    }}
                                    placeholder="10 digit mobile number"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none"
                                />

                                {errors.callingNumber && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.callingNumber}
                                    </p>
                                )}
                            </div>

                            {/* EMAIL */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email ID <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    className={`w-full border rounded-lg px-3 py-2.5 outline-none ${errors.email
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* COMPANY */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company / College Name <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="companyCollegeName"
                                    value={formData.companyCollegeName}
                                    onChange={handleChange}
                                    placeholder="Company / College name"
                                    className={`w-full border rounded-lg px-3 py-2.5 outline-none ${errors.companyCollegeName
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                />

                                {errors.companyCollegeName && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.companyCollegeName}
                                    </p>
                                )}
                            </div>

                            {/* PROFILE */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Profile / Occupation <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="profile"
                                    value={formData.profile}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Engineer / Student"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none"
                                />
                                {errors.profile && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.profile}
                                    </p>
                                )}
                            </div>

                            {/* JOINING DATE */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Joining at PG{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <DatePicker
                                    selected={formData.joiningDate}
                                    onChange={(date) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            joiningDate: date,
                                        }));

                                        setErrors((prev) => ({
                                            ...prev,
                                            joiningDate: "",
                                        }));
                                    }}
                                    minDate={new Date()}
                                    dateFormat="dd MMM yyyy"
                                    placeholderText="Select joining date"
                                    className={`w-full border rounded-lg px-3 py-2.5 outline-none ${errors.joiningDate
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                />

                                {errors.joiningDate && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.joiningDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ================= FAMILY DETAILS ================= */}

                        <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-5">
                            Family Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* FATHER NAME */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Father Name <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={(e) => {
                                        const value = capitalizeName(e.target.value);

                                        setFormData((prev) => ({
                                            ...prev,
                                            fatherName: value,
                                        }));
                                    }}
                                    placeholder="Father name"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none"
                                />
                                {errors.fatherName && (
  <p className="text-red-500 text-xs mt-1">
    {errors.fatherName}
  </p>
)}
                            </div>

                            {/* FATHER CONTACT */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Father Contact No. <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="tel"
                                    name="fatherContact"
                                    maxLength={10}
                                    value={formData.fatherContact}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );

                                        setFormData((prev) => ({
                                            ...prev,
                                            fatherContact: value,
                                        }));

                                        setErrors((prev) => ({
                                            ...prev,
                                            fatherContact: "",
                                        }));
                                    }}
                                    placeholder="10 digit mobile number"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none"
                                />

                                {errors.fatherContact && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.fatherContact}
                                    </p>
                                )}
                            </div>

                            {/* MOTHER NAME */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mother Name <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={(e) => {
                                        const value = capitalizeName(e.target.value);

                                        setFormData((prev) => ({
                                            ...prev,
                                            motherName: value,
                                        }));
                                    }}
                                    placeholder="Mother name"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none"
                                />
                                {errors.motherName && (
  <p className="text-red-500 text-xs mt-1">
    {errors.motherName}
  </p>
)}
                            </div>

                            {/* MOTHER CONTACT */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mother Contact No. <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="tel"
                                    name="motherContact"
                                    maxLength={10}
                                    value={formData.motherContact}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );

                                        setFormData((prev) => ({
                                            ...prev,
                                            motherContact: value,
                                        }));

                                        setErrors((prev) => ({
                                            ...prev,
                                            motherContact: "",
                                        }));
                                    }}
                                    placeholder="10 digit mobile number"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none"
                                />

                                {errors.motherContact && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.motherContact}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ================= SUBMIT ================= */}

                        <div className="mt-8 flex justify-center">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="theme-btn"
                            >
                                {isSubmitting
                                    ? "Submitting..."
                                    : "Submit Booking Request"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingEnquiry;