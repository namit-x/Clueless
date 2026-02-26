// app/team-register/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { useDebounce } from '@/hooks/useDebounce';
import PasswordInput from "@/components/PasswordInput";


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
    teamSize: number | null;
    password: string;
    members: TeamMember[];
}

// Branches for selection
const BRANCHES = [
  'AI',
  'AIDE',
  'AI Driven DevOps',
  'AIML',
  'Blockchain Technology',
  'CSE - *',
  'CSE - General',
  'CSBS',
  'CTIS',
  'CTMA',
  'Cyber Physical Systems',
  'Cyber Security',
  'Data Science',
  'GenAI',
  'IoT',
  'ISE',
  'Software Engineering',
];

const TEAM_SIZES = [2, 3, 4];

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
            className={`glass border border-border rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? 'neon-glow border-primary' : 'hover:border-primary/50'
                }`}
        >
            {/* Card Header - Always visible */}
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer ${isActive ? 'bg-background/60' : 'bg-background/60'
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
                        <h3 className="font-medium text-gray-200">
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
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Full Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={member.name}
                                        onChange={(e) => onChange('name', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none ${errors[`member-${index}-name`]
                                            ? 'border-destructive bg-destructive/10 focus:ring-destructive/30 focus:border-destructive'
                                            : 'border-border'
                                            }`}
                                        placeholder="Namit Rana"
                                    />
                                    {errors[`member-${index}-name`] && (
                                        <p className="mt-1 text-xs text-red-500">{errors[`member-${index}-name`]}</p>
                                    )}
                                </div>

                                {/* Mobile Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Mobile <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={member.mobile}
                                        onChange={(e) => onChange('mobile', e.target.value)}
                                        maxLength={10}
                                        className={`w-full px-4 py-2 border rounded-lg bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none ${errors[`member-${index}-mobile`]
                                            ? 'border-destructive bg-destructive/10 focus:ring-destructive/30 focus:border-destructive'
                                            : 'border-border'
                                            }`}
                                        placeholder="9876543210"
                                    />
                                    {errors[`member-${index}-mobile`] && (
                                        <p className="mt-1 text-xs text-red-500">{errors[`member-${index}-mobile`]}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Email <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={member.email}
                                        onChange={(e) => onChange('email', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none ${errors[`member-${index}-email`]
                                            ? 'border-destructive bg-destructive/10 focus:ring-destructive/30 focus:border-destructive'
                                            : 'border-border'
                                            }`}
                                        placeholder="john@college.edu"
                                    />
                                    {errors[`member-${index}-email`] && (
                                        <p className="mt-1 text-xs text-red-500">{errors[`member-${index}-email`]}</p>
                                    )}
                                </div>

                                {/* Branch Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Branch <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={member.branch}
                                        onChange={(e) => onChange('branch', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none ${errors[`member-${index}-branch`]
                                            ? 'border-destructive bg-destructive/10 focus:ring-destructive/30 focus:border-destructive'
                                            : 'border-border'
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
                                                width: `${[member.name, member.mobile, member.email, member.branch].filter(Boolean).length * 25}%`
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
    const router = useRouter();
    const [teamData, setTeamData] = useState<TeamData>({
        teamName: '',
        teamSize: null,
        password: '',
        members: []
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [teamNameError, setTeamNameError] = useState("");
    const [isCheckingTeamName, setIsCheckingTeamName] = useState(false);
    const [teamNameCheckSuccess, setTeamNameCheckSuccess] = useState(false);

    const [activeMemberIndex, setActiveMemberIndex] = useState<number | null>(null);
    const [submittedTeam, setSubmittedTeam] = useState<TeamData | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Debounce team name to avoid too many API calls
    const debouncedTeamName = useDebounce(teamData.teamName, 300);

    // Live team name validation
    useEffect(() => {
        const checkTeamNameAvailability = async () => {
            // Don't check if team name is empty or less than 3 characters
            if (!debouncedTeamName || debouncedTeamName.trim().length < 3) {
                setTeamNameError("");
                setTeamNameCheckSuccess(false);
                return;
            }

            setIsCheckingTeamName(true);
            setTeamNameError(""); // Clear previous error while checking

            try {
                const response = await fetch('/api/team/check-name', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ teamName: debouncedTeamName }),
                });

                const data = await response.json();

                if (!response.ok) {
                    // Handle validation errors
                    if (data.error) {
                        setTeamNameError(data.error);
                        setTeamNameCheckSuccess(false);
                    }
                    return;
                }

                if (!data.available) {
                    setTeamNameError(data.message || "Team name already taken");
                    setTeamNameCheckSuccess(false);

                    // Also set in errors object for form validation
                    setErrors(prev => ({
                        ...prev,
                        teamName: data.message || "Team name already taken"
                    }));
                } else {
                    setTeamNameError("");
                    setTeamNameCheckSuccess(true);

                    // Clear team name error from errors object
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.teamName;
                        return newErrors;
                    });
                }
            } catch (error) {
                console.error('Error checking team name:', error);
                setTeamNameError("Unable to verify team name. Please try again.");
                setTeamNameCheckSuccess(false);
            } finally {
                setIsCheckingTeamName(false);
            }
        };

        checkTeamNameAvailability();
    }, [debouncedTeamName]);

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
            } else if (teamNameError) {
                newErrors.teamName = teamNameError;
            } else if (!teamNameCheckSuccess) {
                newErrors.teamName = 'Please wait while we check team name availability';
            }

            if (!teamData.password) {
                newErrors.password = 'Password is required';
            } else if (teamData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            }

            if (!teamData.teamSize) {
                newErrors.teamSize = 'Please select team size';
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
        if (validateStep(1)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setFormError(null);

        // Final validation check for team name
        if (teamNameError) {
            setFormError("Please fix the team name error before submitting.");
            return;
        }

        const isValid = validateStep(2);

        if (!isValid) {
            setFormError("Please check all required fields before submitting.");
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            // console.log("================================");
            // console.log(teamData)

            // Uncomment when API is ready
            await fetch("/api/team/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(teamData)
            });

            // Show success message
            setSubmittedTeam(teamData);

        } catch (err) {
            setFormError("Something went wrong. Please try again.");
            console.error("Submission error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setTeamData({
            teamName: '',
            teamSize: null,
            password: '',
            members: []
        });
        setCurrentStep(1);
        setSubmittedTeam(null);
        setErrors({});
        setActiveMemberIndex(null);
        setFormError(null);
        setTeamNameError("");
        setTeamNameCheckSuccess(false);
    };

    return (
        <div className="min-h-screen gradient-bg grid-pattern py-16 px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 text-xl hover:scale-110 transition-transform"
            >
                <FontAwesomeIcon className="p-3 rounded-full bg-muted hover:bg-primary hover:text-white transition-all shadow-md" icon={faAngleLeft} />
            </button>

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="section-title font-display neon-text">
                        Team Registration
                    </h1>
                    <p className="text-muted-foreground">
                        Register your team for the upcoming Event
                    </p>
                </div>

                {/* Progress Steps - Minimal */}
                <div className="flex items-center mb-8 px-4">
                    
                  {/* Step 1 */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm
                    bg-primary text-primary-foreground neon-glow">
                    1
                  </div>
                    
                  {/* Connector */}
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > 1 ? "bg-primary" : "bg-border"
                    }`}
                  />
                
                  {/* Step 2 */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      currentStep >= 2
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    2
                  </div>
                
                </div>

                {/* Main Form */}
                <div className="glass-strong rounded-2xl border border-border p-8 md:p-10">
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
                                        <h2 className="text-2xl font-display text-foreground tracking-wider">Team Details</h2>
{/* Team Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Team Name <span className="text-red-400">*</span>
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={teamData.teamName}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setTeamData((prev) => ({ ...prev, teamName: value }));
                                                        // Clear team name error when user starts typing again
                                                        if (teamNameError) {
                                                            setTeamNameError("");
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-2 border ${errors.teamName || teamNameError
                                                        ? "border-red-500 focus:ring-red-400/30"
                                                        : teamNameCheckSuccess
                                                            ? "border-green-500 focus:ring-green-400/30"
                                                            : "border-border focus:ring-primary/30 focus:border-primary"
                                                        } bg-background/60 backdrop-blur-md rounded-lg transition-all outline-none text-foreground pr-10`}
                                                    placeholder="Enter your team name"
                                                    minLength={3}
                                                    maxLength={50}
                                                />

                                                {/* Status indicator */}
                                                {teamData.teamName.length >= 3 && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        {isCheckingTeamName ? (
                                                            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                                                        ) : teamNameCheckSuccess ? (
                                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : teamNameError ? (
                                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Error/Success message */}
                                            {teamNameError && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {teamNameError}
                                                </p>
                                            )}
                                            {teamNameCheckSuccess && !teamNameError && teamData.teamName.length >= 3 && (
                                                <p className="mt-1 text-sm text-green-500">
                                                    Team name is available!
                                                </p>
                                            )}
                                            {teamData.teamName.length > 0 && teamData.teamName.length < 3 && (
                                                <p className="mt-1 text-sm text-yellow-500">
                                                    Team name must be at least 3 characters
                                                </p>
                                            )}
                                        </div>

{/* New Password Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Password <span className="text-red-400">*</span>
                                            </label>
                                            <PasswordInput
                                                value={teamData.password}
                                                onChange={(e) => {
                                                    setTeamData(prev => ({ ...prev, password: e.target.value }));
                                                    // Clear password error if exists
                                                    if (errors.password) {
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.password;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                className={`w-full px-4 py-2 border ${errors.password
                                                    ? "border-red-500 focus:ring-red-400/30"
                                                    : "border-border focus:ring-primary/30 focus:border-primary"
                                                    } bg-background/60 backdrop-blur-md rounded-lg transition-all outline-none text-foreground`}
                                                placeholder="Enter team password"
                                            />
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.password}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Password must be at least 6 characters
                                            </p>
                                        </div>


{/* Team Size */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Team Size <span className="text-red-400">*</span>
                                            </label>
                                            <div className="flex gap-4">
                                                {TEAM_SIZES.map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => handleTeamSizeChange(size)}
                                                        className={`px-6 py-2 rounded-lg border transition-all ${teamData.teamSize === size
                                                            ? 'bg-primary text-primary-foreground border-primary neon-glow'
                                                            : 'bg-background/60 text-foreground border-border hover:border-primary/50'
                                                            }`}
                                                        type="button"
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.teamSize && (
                                                <p className="mt-1 text-sm text-red-500">{errors.teamSize}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleNextStep}
                                                disabled={!!teamNameError || isCheckingTeamName || !teamData.teamName || !teamData.password || !teamData.teamSize}
                                                className={`px-6 py-2 bg-primary rounded-lg text-primary-foreground neon-glow hover:neon-glow-strong transition-all ${(!!teamNameError || isCheckingTeamName || !teamData.teamName || !teamData.password || !teamData.teamSize)
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                                    }`}
                                            >
                                                Next Step
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Team Members - Creative Expandable Cards */}
                                {currentStep === 2 && (
                                 <div className="space-y-5 sm:space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                                            Team Members
                                        </h2>
                                        <p className="text-xs sm:text-sm text-gray-500">
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
                                    
                                    {formError && (
                                        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-xs sm:text-sm text-red-600 break-words">
                                                {formError}
                                            </p>
                                        </div>
                                    )}
                                
                                    <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3 sm:pt-4">
                                        <button
                                            onClick={handlePrevStep}
                                            className="w-full sm:w-auto px-5 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 rounded-lg border-border text-muted-foreground hover:border-primary hover:text-primary"
                                        >
                                            Back
                                        </button>
                                
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className={`w-full sm:w-auto px-5 sm:px-6 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-900/40 rounded-full mb-4">
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-100 mb-2">Registration Successful!</h2>
                                    <p className="text-gray-400">Your team has been registered</p>
                                </div>

                                {/* Team Summary */}
                                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-5">
                                    <div>
                                        <h3 className="font-medium text-gray-100 mb-2 sm:mb-3 text-sm sm:text-base">
                                            Team Information
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-400 text-xs sm:text-sm">Team Name</p>
                                                <p className="inline-block break-words font-bold text-base sm:text-lg bg-blue-900/40 text-amber-200 px-3 py-1 rounded-xl">
                                                    {submittedTeam.teamName}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400 text-xs sm:text-sm">Team Size</p>
                                                <p className="font-medium text-gray-200 text-sm sm:text-base">
                                                    {submittedTeam.teamSize} members
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-100 mb-2 sm:mb-3 text-sm sm:text-base">
                                            Team Members
                                        </h3>

                                        <div className="space-y-3">
                                            {submittedTeam.members.map((member, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-4 text-xs sm:text-sm"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="font-bold text-sm sm:text-base break-words bg-gray-500 px-1.5 rounded-sm text-gray-950">
                                                            {member.name}
                                                        </span>
                                            
                                                        {member.isLeader && (
                                                            <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">
                                                                Lead
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-2">
                                                        <span className="break-words">
                                                            <span className="text-gray-100">Mobile:</span>{" "}
                                                            <span className="inline-block break-all bg-gray-700 text-gray-300 px-2 py-0.5 rounded-md">
                                                                {member.mobile}
                                                            </span>
                                                        </span>
                                                    
                                                        <span className="break-words">
                                                            <span className="text-gray-100">Email:</span>{" "}
                                                            <span className="inline-block break-all bg-gray-700 text-gray-300 px-2 py-0.5 rounded-md">
                                                                {member.email}
                                                            </span>
                                                        </span>
                                                    
                                                        <span className="break-words">
                                                            <span className="text-gray-100">Branch:</span>{" "}
                                                            <span className="inline-block break-words bg-gray-700 text-gray-300 px-2 py-0.5 rounded-md">
                                                                {member.branch}
                                                            </span>
                                                        </span>
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
                {/* <p className="mt-6 text-center text-sm text-gray-500">
                    Event registration • All fields marked with <span className="text-red-400">*</span> are required
                </p> */}
            </div>
        </div>
    );
}