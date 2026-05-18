import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import InvestigationFollowUp from "./InvestigationFollowUp";

export default function InvestigationFollowUpWrapper() {
    const location = useLocation();
    const occurrence = location.state?.occurrence;

    if (!occurrence || !occurrence._id) {
        // If accessed directly without state, redirect back to list
        return <Navigate to="/list" replace />;
    }

    return (
        <InvestigationFollowUp
            occurrenceId={occurrence._id}
            initialData={occurrence}
            onBack={() => window.history.back()}
        />
    );
}
