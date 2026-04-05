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
    teamSize: number;
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

const TEAM_SIZE = 4;

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
                        ? 'bg-warning/20 text-warning'
                        : isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">
                            {`Member ${index + 1}`}
                            {member.isLeader && (
                                <span className="ml-2 text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                                    Lead
                                </span>
                            )}
                        </h3>
                        {member.name && (
                            <p className="text-sm text-muted-foreground">{member.name}</p>
                        )}
                    </div>
                </div>
                <div className="text-muted-foreground">
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
                        className="border-t border-border"
                    >
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Full Name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={member.name}
                                        onChange={(e) => onChange('name', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none ${errors[`member-${index}-name`]
                                            ? 'border-destructive bg-destructive/10 focus:ring-destructive/30 focus:border-destructive'
                                            : 'border-border'
                                            }`}
                                        placeholder="Tony Stark"
                                    />
                                    {errors[`member-${index}-name`] && (
                                        <p className="mt-1 text-xs text-destructive">{errors[`member-${index}-name`]}</p>
                                    )}
                                </div>

                                {/* Mobile Field */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Mobile <span className="text-destructive">*</span>
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
                                        placeholder="7653032020"
                                    />
                                    {errors[`member-${index}-mobile`] && (
                                        <p className="mt-1 text-xs text-destructive">{errors[`member-${index}-mobile`]}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Email <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={member.email}
                                        onChange={(e) => onChange('email', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none ${errors[`member-${index}-email`]
                                            ? 'border-destructive bg-destructive/10 focus:ring-destructive/30 focus:border-destructive'
                                            : 'border-border'
                                            }`}
                                        placeholder="stark@gmail.com"
                                    />
                                    {errors[`member-${index}-email`] && (
                                        <p className="mt-1 text-xs text-destructive">{errors[`member-${index}-email`]}</p>
                                    )}
                                </div>

                                {/* Branch Field */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Branch <span className="text-destructive">*</span>
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
                                        <p className="mt-1 text-xs text-destructive">{errors[`member-${index}-branch`]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Progress indicator for this member */}
                            <div className="pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${[member.name, member.mobile, member.email, member.branch].filter(Boolean).length * 25}%`
                                            }}
                                            className="h-full bg-primary rounded-full"
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
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
        teamSize: TEAM_SIZE,
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
    const shouldCenterDesktopStepOne = currentStep === 1 && !submittedTeam;

    // Initialize 4 members on mount
    useEffect(() => {
        initializeMembers(TEAM_SIZE);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            // Request
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(teamData),
            });

            // Parse backend response
            const data = await res.json();

            const responseMessage = data?.error || data?.message || "Request failed";

            // ✅ Print status + message in console
            console.log("Status Code:", res.status);
            console.log("Response Message:", responseMessage);
            console.log("Full Response:", data);

            // If backend returned error status
            if (!res.ok) {
                throw new Error(responseMessage);
            }

            // Success
            setSubmittedTeam(teamData);

        } catch (err: any) {
            console.error("Submission error:", err);

            setFormError(
                err.message || "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setTeamData({
            teamName: '',
            teamSize: TEAM_SIZE,
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
        initializeMembers(TEAM_SIZE);
    };

    return (
        <div
            className={`min-h-screen px-4 py-8 sm:px-6 sm:py-12 lg:px-8 ${shouldCenterDesktopStepOne ? "lg:flex lg:items-center" : ""
                }`}
        >
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-20 text-xl hover:scale-105 active:scale-95 transition-transform duration-200"
            >
                <FontAwesomeIcon className="p-3 rounded-full bg-muted hover:bg-primary hover:text-white transition-all duration-200 shadow-md" icon={faAngleLeft} />
            </button>

            <div
                className={`mx-auto w-full max-w-3xl ${shouldCenterDesktopStepOne ? "lg:flex lg:min-h-[calc(100vh-6rem)] lg:flex-col lg:justify-center" : ""
                    }`}
            >
                {/* Header */}
                <div className="text-center mb-5">
                    <h1 className="section-title font-display neon-text">
                        Team Registration
                    </h1>
                    <p className="text-muted-foreground">
                        Register your team for the upcoming Event
                    </p>
                </div>

                {/* Progress Steps - Minimal */}
                <div className="flex items-center mb-5 px-4">

                    {/* Step 1 */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm
                    bg-primary text-primary-foreground neon-glow">
                        1
                    </div>

                    {/* Connector */}
                    <div
                        className={`flex-1 h-0.5 mx-4 ${currentStep > 1 ? "bg-primary" : "bg-border"
                            }`}
                    />

                    {/* Step 2 */}
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep >= 2
                            ? "bg-primary text-primary-foreground neon-glow"
                            : "bg-muted text-muted-foreground"
                            }`}
                    >
                        2
                    </div>

                </div>

                {/* Main Form */}
                <div className="glass-strong rounded-2xl border border-border p-5 sm:p-7">
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
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-display text-foreground tracking-wider">Team Details</h2>
                                        {/* Team Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                                Team Name <span className="text-destructive">*</span>
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
                                                        ? "border-destructive focus:ring-destructive/30"
                                                        : teamNameCheckSuccess
                                                            ? "border-success focus:ring-success/30"
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
                                                            <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                                                        ) : teamNameCheckSuccess ? (
                                                            <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : teamNameError ? (
                                                            <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Error/Success message */}
                                            {teamNameError && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {teamNameError}
                                                </p>
                                            )}
                                            {teamNameCheckSuccess && !teamNameError && teamData.teamName.length >= 3 && (
                                                <p className="mt-1 text-sm text-success">
                                                    Team name is available!
                                                </p>
                                            )}
                                            {teamData.teamName.length > 0 && teamData.teamName.length < 3 && (
                                                <p className="mt-1 text-sm text-warning">
                                                    Team name must be at least 3 characters
                                                </p>
                                            )}
                                        </div>

                                        {/* New Password Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                                Password <span className="text-destructive">*</span>
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
                                                    ? "border-destructive focus:ring-destructive/30"
                                                    : "border-border focus:ring-primary/30 focus:border-primary"
                                                    } bg-background/60 backdrop-blur-md rounded-lg transition-all outline-none text-foreground`}
                                                placeholder="Enter team password"
                                            />
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.password}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Password must be at least 6 characters
                                            </p>
                                        </div>


                                        {/* Team Size */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground">Team Size:</span>
                                            <div className="px-4 py-1 rounded-lg border border-primary bg-primary/10 text-primary font-semibold text-sm">
                                                4 Members
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={handleNextStep}
                                                disabled={!!teamNameError || isCheckingTeamName || !teamData.teamName || !teamData.password}
                                                className={`px-6 py-2 bg-primary rounded-lg text-primary-foreground neon-glow hover:neon-glow-strong transition-all ${(!!teamNameError || isCheckingTeamName || !teamData.teamName || !teamData.password)
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                                    }`}
                                            >
                                                Next Step
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Team Members */}
                                {currentStep === 2 && (
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pb-1">
                                            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                                                Team Members
                                            </h2>
                                            <div className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 rounded-full w-fit">
                                                <p className="text-xs sm:text-sm font-medium text-primary">
                                                    {teamData.members.filter(m => m.name && m.email && m.mobile && m.branch).length} of {teamData.teamSize} completed
                                                </p>
                                            </div>
                                        </div>

                                        {/* ── MOBILE: tab switcher + single card ── */}
                                        <div className="sm:hidden space-y-4">
                                            {/* Member tab buttons */}
                                            <div className="grid grid-cols-4 gap-2">
                                                {teamData.members.map((member, index) => {
                                                    const filled = [member.name, member.mobile, member.email, member.branch].filter(Boolean).length === 4;
                                                    const hasError = ['name', 'mobile', 'email', 'branch'].some(f => errors[`member-${index}-${f}`]);
                                                    const isSelected = activeMemberIndex === index;
                                                    return (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => setActiveMemberIndex(index)}
                                                            className={`relative flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${isSelected
                                                                ? 'border-primary bg-primary/10 text-primary neon-glow'
                                                                : 'border-border bg-background/40 text-muted-foreground hover:border-primary/50'
                                                                }`}
                                                        >
                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${member.isLeader ? 'bg-warning/20 text-warning' : isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                                                }`}>
                                                                {index + 1}
                                                            </span>
                                                            <span className="leading-none">{member.isLeader ? 'Lead' : `M${index + 1}`}</span>
                                                            {/* status dot */}
                                                            <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${hasError ? 'bg-destructive' : filled ? 'bg-success' : 'bg-muted'
                                                                }`} />
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Single active card - fully expanded */}
                                            <AnimatePresence mode="wait">
                                                {activeMemberIndex !== null && teamData.members[activeMemberIndex] && (
                                                    <motion.div
                                                        key={activeMemberIndex}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="glass border border-primary/30 rounded-2xl overflow-hidden"
                                                    >
                                                        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background/60">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${teamData.members[activeMemberIndex].isLeader ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                                                                    }`}>
                                                                    {activeMemberIndex + 1}
                                                                </div>
                                                                <span className="font-semibold text-sm text-foreground">
                                                                    {`Member ${activeMemberIndex + 1}`}
                                                                    {teamData.members[activeMemberIndex].isLeader && (
                                                                        <span className="ml-2 text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">Lead</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {[teamData.members[activeMemberIndex].name, teamData.members[activeMemberIndex].mobile, teamData.members[activeMemberIndex].email, teamData.members[activeMemberIndex].branch].filter(Boolean).length}/4
                                                            </span>
                                                        </div>
                                                        <div className="p-4 space-y-3">
                                                            {(['name', 'mobile', 'email', 'branch'] as (keyof TeamMember)[]).map((field) => (
                                                                <div key={field}>
                                                                    <label className="block text-sm font-medium text-muted-foreground mb-1 capitalize">
                                                                        {field === 'name' ? 'Full Name' : field.charAt(0).toUpperCase() + field.slice(1)} <span className="text-destructive">*</span>
                                                                    </label>
                                                                    {field === 'branch' ? (
                                                                        <select
                                                                            value={teamData.members[activeMemberIndex][field]}
                                                                            onChange={(e) => handleMemberChange(activeMemberIndex, field, e.target.value)}
                                                                            className={`w-full px-4 py-2.5 border rounded-lg bg-background/60 backdrop-blur-md text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none ${errors[`member-${activeMemberIndex}-${field}`] ? 'border-destructive bg-destructive/10' : 'border-border'}`}
                                                                        >
                                                                            <option value="">Select branch</option>
                                                                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                                                        </select>
                                                                    ) : (
                                                                        <input
                                                                            type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
                                                                            value={teamData.members[activeMemberIndex][field] as string}
                                                                            onChange={(e) => handleMemberChange(activeMemberIndex, field, e.target.value)}
                                                                            maxLength={field === 'mobile' ? 10 : undefined}
                                                                            className={`w-full px-4 py-2.5 border rounded-lg bg-background/60 backdrop-blur-md text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none ${errors[`member-${activeMemberIndex}-${field}`] ? 'border-destructive bg-destructive/10' : 'border-border'}`}
                                                                            placeholder={field === 'name' ? 'Tony Stark' : field === 'mobile' ? '9876543210' : 'stark@gmail.com'}
                                                                        />
                                                                    )}
                                                                    {errors[`member-${activeMemberIndex}-${field}`] && (
                                                                        <p className="mt-1 text-xs text-destructive">{errors[`member-${activeMemberIndex}-${field}`]}</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {/* progress bar */}
                                                        <div className="px-4 pb-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        animate={{ width: `${[teamData.members[activeMemberIndex].name, teamData.members[activeMemberIndex].mobile, teamData.members[activeMemberIndex].email, teamData.members[activeMemberIndex].branch].filter(Boolean).length * 25}%` }}
                                                                        className="h-full bg-primary rounded-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ── DESKTOP: accordion cards ── */}
                                        <div className="hidden sm:block space-y-4 sm:space-y-5">
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

                                        {/* Error Message - Better visual feedback on mobile */}
                                        {formError && (
                                            <div className="p-3 sm:p-4 bg-destructive/10 border-l-4 border-destructive rounded-lg">
                                                <p className="text-xs sm:text-sm text-destructive font-medium break-words">
                                                    {formError}
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Buttons - Mobile-first layout */}
                                        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2 sm:pt-4">
                                            <button
                                                onClick={handlePrevStep}
                                                className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2.5 text-sm sm:text-base font-medium border-2 border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 active:scale-[0.98]"
                                            >
                                                Back
                                            </button>

                                            <button
                                                onClick={handleSubmit}
                                                disabled={isLoading}
                                                className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2.5 text-sm sm:text-base font-semibold bg-primary text-primary-foreground rounded-xl neon-glow hover:neon-glow-strong transition-all duration-200 active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Submitting...
                                                    </span>
                                                ) : (
                                                    'Submit Registration'
                                                )}
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
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-success/20 rounded-full mb-4">
                                        <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Registration Successful!</h2>
                                    <p className="text-muted-foreground">Your team has been registered</p>
                                    <br />
                                    <a
                                        href="https://chat.whatsapp.com/DszaCFRNBLRERu4PBf3pS9?mode=gi_t"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center bg-[#25D366] text-primary-foreground py-2 px-4 rounded-lg transition-all duration-300 hover:bg-[#1ebe5d] hover:scale-105  hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Join WhatsApp Group
                                    </a>
                                </div>

                                {/* Team Summary */}
                                <div className="glass border border-border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-5">
                                    <div>
                                        <h3 className="font-medium text-foreground mb-2 sm:mb-3 text-sm sm:text-base">
                                            Team Information
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-muted-foreground text-xs sm:text-sm">Team Name</p>
                                                <p className="inline-block break-words font-bold text-base sm:text-lg bg-primary/20 text-primary px-3 py-1 rounded-xl">
                                                    {submittedTeam.teamName}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-muted-foreground text-xs sm:text-sm">Team Size</p>
                                                <p className="font-medium text-foreground/80 text-sm sm:text-base">
                                                    {submittedTeam.teamSize} members
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-foreground mb-2 sm:mb-3 text-sm sm:text-base">
                                            Team Members
                                        </h3>

                                        <div className="space-y-3">
                                            {submittedTeam.members.map((member, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4 text-xs sm:text-sm"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="font-bold text-sm sm:text-base break-words bg-primary/20 px-1.5 rounded-sm text-foreground">
                                                            {member.name}
                                                        </span>

                                                        {member.isLeader && (
                                                            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                                                                Lead
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <span className="break-words">
                                                            <span className="text-foreground">Mobile:</span>{" "}
                                                            <span className="inline-block break-all bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                                                                {member.mobile}
                                                            </span>
                                                        </span>

                                                        <span className="break-words">
                                                            <span className="text-foreground">Email:</span>{" "}
                                                            <span className="inline-block break-all bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                                                                {member.email}
                                                            </span>
                                                        </span>

                                                        <span className="break-words">
                                                            <span className="text-foreground">Branch:</span>{" "}
                                                            <span className="inline-block break-words bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                                                                {member.branch}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Next Steps */}
                                <div className="rounded-xl bg-muted/20 border border-border p-4 text-sm space-y-2">
                                    <p className="font-medium text-foreground">What happens next?</p>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• Join the Participants WhatsApp group.</li>
                                        <li>• Stay active there for all important updates.</li>
                                        <li>• Check Zigbee and Neuron club pages for announcements.</li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => router.push("/")}
                                    className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg neon-glow hover:neon-glow-strong transition-all"
                                >
                                    Back to Home
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
