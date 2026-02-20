// app/team-register/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginAction } from '@/app/api/auth/route'

// Types
export interface TeamMember {
    name: string;
    mobile: string;
    email: string;
    branch: string;
    isLeader: boolean;
}

export interface TeamData {
    teamName: string;
    teamSize: number;
    members: TeamMember[];
}

// Branches for selection
const BRANCHES = [
    'Computer Science Engineering',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biotechnology'
];

const TEAM_SIZES = [2, 3, 4, 5];

// Creative card component for team member input
const MemberInputCard = ({
    member,
    index,
    onChange,
    errors,
    isActive,
    onActivate
}: {
    member: TeamMember;
    index: number;
    onChange: (field: keyof TeamMember, value: string) => void;
    errors: Record<string, string>;
    isActive: boolean;
    onActivate: () => void;
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${isActive
                ? 'border-blue-400 shadow-lg shadow-blue-100'
                : 'border-gray-200 hover:border-gray-300'
                }`}
        >
            {/* Card Header - Always visible */}
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer ${isActive ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                onClick={onActivate}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${member.isLeader
                        ? 'bg-amber-100 text-amber-700'
                        : isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">
                            {member.isLeader ? 'Team Lead' : `Member ${index + 1}`}
                            {member.isLeader && (
                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                    Lead
                                </span>
                            )}
                        </h3>
                        {member.name && (
                            <p className="text-sm text-gray-500">{member.name}</p>
                        )}
                    </div>
                </div>
                <div className="text-gray-400">
                    {isActive ? '▼' : '▶'}
                </div>
            </div>

            {/* Card Content - Expandable */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200"
                    >
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={member.name}
                                        onChange={(e) => onChange('name', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none ${errors[`member-${index}-name`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="Namit Rana"
                                    />
                                    {errors[`member-${index}-name`] && (
                                        <p className="mt-1 text-xs text-red-500">{errors[`member-${index}-name`]}</p>
                                    )}
                                </div>

                                {/* Mobile Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mobile <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={member.mobile}
                                        onChange={(e) => onChange('mobile', e.target.value)}
                                        maxLength={10}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none ${errors[`member-${index}-mobile`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="9876543210"
                                    />
                                    {errors[`member-${index}-mobile`] && (
                                        <p className="mt-1 text-xs text-red-500">{errors[`member-${index}-mobile`]}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={member.email}
                                        onChange={(e) => onChange('email', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none ${errors[`member-${index}-email`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="john@college.edu"
                                    />
                                    {errors[`member-${index}-email`] && (
                                        <p className="mt-1 text-xs text-red-500">{errors[`member-${index}-email`]}</p>
                                    )}
                                </div>

                                {/* Branch Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Branch <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={member.branch}
                                        onChange={(e) => onChange('branch', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none bg-white ${errors[`member-${index}-branch`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select branch</option>
                                        {BRANCHES.map(branch => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                    {errors[`member-${index}-branch`] && (
                                        <p className="mt-1 text-xs text-red-500">{errors[`member-${index}-branch`]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Progress indicator for this member */}
                            <div className="pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${[member.name, member.mobile, member.email, member.branch].filter(Boolean).length * 25
                                                    }%`
                                            }}
                                            className="h-full bg-blue-400 rounded-full"
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {[member.name, member.mobile, member.email, member.branch].filter(Boolean).length}/4
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function TeamRegistrationPage() {
    const [teamData, setTeamData] = useState<TeamData>({
        teamName: '',
        teamSize: 3,
        members: []
    });

    const [activeMemberIndex, setActiveMemberIndex] = useState<number | null>(null);
    const [submittedTeam, setSubmittedTeam] = useState<TeamData | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Initialize members when team size changes
    const initializeMembers = (size: number) => {
        const newMembers: TeamMember[] = [];
        for (let i = 0; i < size; i++) {
            newMembers.push({
                name: '',
                mobile: '',
                email: '',
                branch: '',
                isLeader: i === 0
            });
        }
        setTeamData(prev => ({ ...prev, members: newMembers }));
        if (newMembers.length > 0) {
            setActiveMemberIndex(0);
        }
    };

    // Handle team size change
    const handleTeamSizeChange = (size: number) => {
        setTeamData(prev => ({ ...prev, teamSize: size }));
        initializeMembers(size);
    };

    // Handle member field changes
    const handleMemberChange = (memberIndex: number, field: keyof TeamMember, value: string) => {
        setTeamData(prev => ({
            ...prev,
            members: prev.members.map((member, idx) =>
                idx === memberIndex ? { ...member, [field]: value } : member
            )
        }));

        // Clear error for this field
        if (errors[`member-${memberIndex}-${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`member-${memberIndex}-${field}`];
                return newErrors;
            });
        }
    };

    // Validation
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!teamData.teamName.trim()) {
                newErrors.teamName = 'Team name is required';
            }
        }

        if (step === 2) {
            teamData.members.forEach((member, index) => {
                if (!member.name.trim()) {
                    newErrors[`member-${index}-name`] = 'Name is required';
                }
                if (!member.mobile) {
                    newErrors[`member-${index}-mobile`] = 'Mobile number is required';
                } else if (!/^[6-9]\d{9}$/.test(member.mobile)) {
                    newErrors[`member-${index}-mobile`] = 'Invalid mobile number';
                }
                if (!member.email) {
                    newErrors[`member-${index}-email`] = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
                    newErrors[`member-${index}-email`] = 'Invalid email';
                }
                if (!member.branch) {
                    newErrors[`member-${index}-branch`] = 'Branch is required';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (validateStep(2)) {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            // setSubmittedTeam(teamData);
            loginAction(teamData);
            console.log(teamData);
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setTeamData({
            teamName: '',
            teamSize: 3,
            members: []
        });
        setCurrentStep(1);
        setSubmittedTeam(null);
        setErrors({});
        setActiveMemberIndex(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Team Registration
                    </h1>
                    <p className="text-gray-600">
                        Register your team for the upcoming hackathon
                    </p>
                </div>

                {/* Progress Steps - Minimal */}
                <div className="flex justify-between items-center mb-8 px-4">
                    {[1, 2].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep >= step
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step}
                            </div>
                            {step < 2 && (
                                <div className={`w-16 h-0.5 mx-2 ${currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Main Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        {!submittedTeam ? (
                            <motion.div
                                key={`step-${currentStep}`}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Step 1: Team Basics */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-semibold text-gray-800">Team Details</h2>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Team Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={teamData.teamName}
                                                onChange={(e) => {
                                                    setTeamData(prev => ({ ...prev, teamName: e.target.value }));
                                                    if (errors.teamName) {
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.teamName;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none"
                                                placeholder="Enter your team name"
                                            />
                                            {errors.teamName && (
                                                <p className="mt-1 text-sm text-red-500">{errors.teamName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Team Size <span className="text-red-400">*</span>
                                            </label>
                                            <div className="flex gap-3">
                                                {TEAM_SIZES.map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => handleTeamSizeChange(size)}
                                                        className={`px-6 py-2 rounded-lg border transition-all ${teamData.teamSize === size
                                                            ? 'bg-blue-500 text-white border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleNextStep}
                                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                Next Step
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Team Members - Creative Expandable Cards */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
                                            <p className="text-sm text-gray-500">
                                                {teamData.members.filter(m => m.name && m.email && m.mobile && m.branch).length} of {teamData.teamSize} completed
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            {teamData.members.map((member, index) => (
                                                <MemberInputCard
                                                    key={index}
                                                    member={member}
                                                    index={index}
                                                    onChange={(field, value) => handleMemberChange(index, field, value)}
                                                    errors={errors}
                                                    isActive={activeMemberIndex === index}
                                                    onActivate={() => setActiveMemberIndex(index)}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <button
                                                onClick={handlePrevStep}
                                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isLoading}
                                                className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                {isLoading ? 'Submitting...' : 'Submit Registration'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* Success Screen - Clean Summary */
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Registration Successful!</h2>
                                    <p className="text-gray-600">Your team has been registered</p>
                                </div>

                                {/* Team Summary */}
                                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-3">Team Information</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">Team Name</p>
                                                <p className="font-medium text-gray-900">{submittedTeam.teamName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Team Size</p>
                                                <p className="font-medium text-gray-900">{submittedTeam.teamSize} members</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-3">Team Members</h3>
                                        <div className="space-y-3">
                                            {submittedTeam.members.map((member, index) => (
                                                <div key={index} className="bg-white rounded-lg p-3 text-sm">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium text-gray-900">{member.name}</span>
                                                        {member.isLeader && (
                                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                                Lead
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                                                        <span>{member.mobile}</span>
                                                        <span>{member.email}</span>
                                                        <span className="col-span-2">{member.branch}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Register Another Team
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Simple Footer */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    Hackathon registration • All fields marked with <span className="text-red-400">*</span> are required
                </p>
            </div>
        </div>
    );
}