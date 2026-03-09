/* eslint-disable */
import React, { useState, useEffect } from 'react';
import fdmApi from '../api/fdmApi';
import "../styles/fdmForm.css";
import { 
    tailNumbers, 
    airports, 
    spiOptions, 
    flightPhaseOptionsList 
} from '../constants/occurrenceConstants'; 
import { Mail, Plus, FileText, Upload, Info, Shield, RotateCcw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const STATUS_MODES = ["Pending", "Closed: Briefing", "Closed: Training", "AUTO-SYNCED"];

const FdmEntryPage = () => {
    const [syncedEvents, setSyncedEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isManual, setIsManual] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const initialFormState = {
        fleetType: '',
        tailNumber: '',
        occurrenceDate: '',
        departureAirport: '',
        arrivalAirport: '',
        eventName: '',
        spi: '',
        flightPhase: '',
        remarks: '',
        status: 'Pending',
        attachment: null 
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { loadSyncs(); }, []);

    const loadSyncs = async () => {
        try {
            const res = await fdmApi.getAllEvents();
            const rawData = res.data?.data || [];
            // Filter: Only show items that are freshly synced and not yet fully processed
            const autoSyncs = rawData.filter(e => 
                e.status === 'AUTO-SYNCED' || (e.syncTag && e.status === 'Pending')
            );
            setSyncedEvents(autoSyncs);
        } catch (err) { console.error("Sync Load Error:", err); }
    };

    const handleViewDetail = (event) => {
        setIsManual(false);
        setSelectedEvent(event);
        
        // Date formatting for the <input type="date" />
        const formattedDate = event.occurrenceDate ? new Date(event.occurrenceDate).toISOString().split('T')[0] : "";
        const emailBody = event.discussionHistory?.[event.discussionHistory.length - 1]?.body || event.remarks || '';

        setFormData({
            ...initialFormState,
            ...event,
            occurrenceDate: formattedDate,
            fleetType: (event.fleetType === "TBD" || event.fleetType === "UNKNOWN") ? "" : event.fleetType,
            tailNumber: (event.tailNumber === "TBD" || event.tailNumber === "UNKNOWN") ? "" : event.tailNumber,
            remarks: emailBody,
            status: 'Pending' 
        });
        
        // Auto-scroll to form
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Prepare FormData for multipart/form-data (required for attachments)
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                // Handle files separately
                if (key === 'attachment') {
                    if (formData[key] instanceof File) {
                        data.append('file', formData[key]); // 'file' matches the multer key in backend
                    }
                } else {
                    data.append(key, formData[key]);
                }
            }
        });

        try {
            if (selectedEvent?._id) {
                // Use update route to "close" the sync record
                await fdmApi.updateEvent(selectedEvent._id, data);
            } else {
                // Create new record
                await fdmApi.createEvent(data);
            }
            alert("✅ Safety record successfully committed to database.");
            handleClearForm();
            loadSyncs();
        } catch (err) {
            console.error("Submit Error:", err);
            alert(`Submission Failed: ${err.response?.data?.message || "Internal Server Error"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClearForm = () => {
        setFormData(initialFormState);
        setSelectedEvent(null);
        setIsManual(false);
    };

    return (
        <div className="fdm-single-page">
            <div className="entry-header">
                <div className="brand-stack">
                    <h1><Shield className="shield-icon" /> FDM Entry Center</h1>
                    <p>Safety Data Processing & Validation Portal</p>
                </div>
                <button className="btn-manual-add" onClick={() => { setIsManual(true); setSelectedEvent(null); setFormData(initialFormState); }}>
                    <Plus size={18} /> New Manual Entry
                </button>
            </div>

            <div className="sync-section">
                <div className="section-title">
                    <Mail size={18} className="text-blue-500" /> 
                    <h3>Pending Automated Syncs ({syncedEvents.length})</h3>
                </div>
                <div className="table-wrapper">
                    <table className="sync-table">
                        <thead>
                            <tr>
                                <th>Sync Tag / Reference</th>
                                <th>Source Status</th>
                                <th>Received</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {syncedEvents.map(e => (
                                <tr key={e._id} className={selectedEvent?._id === e._id ? "row-active" : ""}>
                                    <td>
                                        <div className="file-info-cell font-mono">
                                            <FileText size={16} className="text-slate-400" /> 
                                            <span className="text-blue-700 font-bold">{e.syncTag || "E-SYNC"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${e.status.toLowerCase().replace(/[:\s]/g, '')}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="text-sm text-slate-500">
                                        {new Date(e.createdAt).toLocaleString()}
                                    </td>
                                    <td className="text-right">
                                        <button className="btn-view" onClick={() => handleViewDetail(e)}>
                                            Process Event
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {syncedEvents.length === 0 && (
                        <div className="empty-state">
                            <CheckCircle2 size={40} className="text-green-500 mb-2" />
                            <p>Queue Clear: All syncs processed.</p>
                        </div>
                    )}
                </div>
            </div>

            {(selectedEvent || isManual) && (
                <div className="form-container-bottom animate-slide-up">
                    <div className="form-header-row">
                        <div className="form-header-text">
                            <div className="badge-mode">{isManual ? "MANUAL ENTRY" : "SYNC VALIDATION"}</div>
                            <h2 className="form-title">
                                {isManual ? "Submit New Safety Record" : `Validating Sync: ${selectedEvent.syncTag}`}
                            </h2>
                        </div>
                        <button className="btn-clear" onClick={handleClearForm}>
                            <RotateCcw size={14} /> Reset
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="fdm-grid-form">
                        {/* Row 1: Aircraft Info */}
                        <div className="form-group">
                            <label>Fleet Type</label>
                            <select name="fleetType" value={formData.fleetType} onChange={handleChange} required>
                                <option value="">-- Fleet --</option>
                                {Object.keys(tailNumbers).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tail Number</label>
                            <select name="tailNumber" value={formData.tailNumber} onChange={handleChange} required>
                                <option value="">-- Registration --</option>
                                {formData.fleetType && tailNumbers[formData.fleetType]?.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Row 2: Event Info */}
                        <div className="form-group span-2">
                            <label>Event Descriptor</label>
                            <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} required placeholder="e.g., Unstable Approach" />
                        </div>

                        {/* Row 3: Indicators */}
                        <div className="form-group">
                            <label>SPI Indicator</label>
                            <select name="spi" value={formData.spi} onChange={handleChange} required>
                                <option value="">-- SPI --</option>
                                {spiOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Flight Phase</label>
                            <select name="flightPhase" value={formData.flightPhase} onChange={handleChange} required>
                                <option value="">-- Phase --</option>
                                {flightPhaseOptionsList.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Occurrence Date</label>
                            <input type="date" name="occurrenceDate" value={formData.occurrenceDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Processing Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className="status-select-highlight">
                                {STATUS_MODES.filter(s => s !== "AUTO-SYNCED").map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Row 4: Airports */}
                        <div className="form-group">
                            <label>Departure (ICAO)</label>
                            <input list="air-list" name="departureAirport" value={formData.departureAirport} onChange={handleChange} required placeholder="HAAB" />
                        </div>
                        <div className="form-group">
                            <label>Arrival (ICAO)</label>
                            <input list="air-list" name="arrivalAirport" value={formData.arrivalAirport} onChange={handleChange} required placeholder="KJFK" />
                        </div>

                        {/* Textarea */}
                        <div className="form-group span-2">
                            <label>Management Remarks & Investigation Summary</label>
                            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="4" required placeholder="Detail the investigation findings and root causes..." />
                        </div>

                        {/* Attachment */}
                        <div className="form-group span-2">
                            <label className="upload-zone">
                                <Upload size={20} />
                                <span>{formData.attachment ? `File: ${formData.attachment.name}` : "Drop Safety Report (PDF/JPG)"}</span>
                                <input type="file" name="attachment" onChange={handleChange} className="hidden" accept=".pdf,.jpg,.png" />
                            </label>
                        </div>

                        <button type="submit" className="btn-save-main" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Commit to Safety Database"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FdmEntryPage;