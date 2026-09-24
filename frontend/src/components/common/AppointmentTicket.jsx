import React from "react";
import { useRef } from 'react';
import Logo from './Logo';
import Button from '../ui/Button';

/**
 * Professional printable ticket/receipt for patient appointments.
 * Designed to fit on a single page when printed or exported to PDF.
 * Includes UpcharGanga branding, appointment details, and queue information.
 */
const AppointmentTicket = ({ appointment, queueInfo, onClose }) => {
  const ticketRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (!appointment) {
    return (
      <div className="p-4 text-center text-gray-500">
        No appointment data available
      </div>
    );
  }

  return (
    <div>
      {/* Print Button */}
      <div className="mb-6 flex gap-3 print:hidden">
        <Button onClick={handlePrint} variant="primary">
          🖨️ Print Ticket
        </Button>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>

      {/* Ticket Content - Optimized for Print */}
      <div
        ref={ticketRef}
        className="max-w-2xl mx-auto bg-white p-8 print:p-4 print:max-w-full print:margin-0"
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {/* Header with Logo */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
          <div className="flex justify-center mb-2">
            <Logo size={48} showWordmark={true} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">APPOINTMENT TICKET</h1>
          <p className="text-xs text-gray-600 mt-1">Smart Hospital Queue Management</p>
        </div>

        {/* Booking Reference */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
          <div className="text-center">
            <p className="text-xs uppercase text-gray-600 tracking-widest mb-1">
              Booking Reference
            </p>
            <p className="text-2xl font-bold text-blue-700 font-mono">
              {appointment.bookingNumber}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Token #: <span className="font-bold">{appointment.tokenNumber}</span>
            </p>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase text-gray-700 mb-3 pb-2 border-b">
            Patient Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-600">Patient Name</p>
              <p className="font-semibold text-gray-900">
                {appointment.patient ? appointment.patient.fullName : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Contact</p>
              <p className="font-semibold text-gray-900">
                {appointment.patient ? appointment.patient.phone : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase text-gray-700 mb-3 pb-2 border-b">
            Appointment Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(appointment.appointmentDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Time Slot</p>
              <p className="font-semibold text-gray-900">
                {formatTime(appointment.timeSlot?.start)} - {formatTime(appointment.timeSlot?.end)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <p className="font-semibold text-gray-900 uppercase">
                {appointment.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Consultation Type</p>
              <p className="font-semibold text-gray-900">
                {appointment.consultationType === 'online-booking' ? 'Online Booking' : 'Walk-in'}
              </p>
            </div>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase text-gray-700 mb-3 pb-2 border-b">
            Doctor Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <p className="text-xs text-gray-600">Doctor Name</p>
              <p className="font-semibold text-gray-900 text-lg">
                Dr. {appointment.doctor?.user?.fullName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Department</p>
              <p className="font-semibold text-gray-900">
                {appointment.department?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Specialization</p>
              <p className="font-semibold text-gray-900">
                {appointment.doctor?.specialization || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Hospital Information */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase text-gray-700 mb-3 pb-2 border-b">
            Hospital Information
          </h2>
          <div className="text-sm">
            <p className="text-xs text-gray-600">Hospital Name</p>
            <p className="font-semibold text-gray-900 mb-2">
              {appointment.hospital?.name || 'N/A'}
            </p>
            <p className="text-xs text-gray-600">Address</p>
            <p className="text-gray-900 text-sm">
              {appointment.hospital?.address?.line1 || 'N/A'}
            </p>
            {appointment.hospital?.contact?.phone && (
              <>
                <p className="text-xs text-gray-600 mt-2">Contact</p>
                <p className="text-gray-900 text-sm">
                  {appointment.hospital.contact.phone}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Queue Information (if available) */}
        {queueInfo && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 rounded">
            <h2 className="text-sm font-bold uppercase text-gray-700 mb-3">
              Queue Status
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Your Position</p>
                <p className="text-xl font-bold text-green-700">
                  {queueInfo.queuePosition || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Currently Serving</p>
                <p className="text-xl font-bold text-green-700">
                  #{queueInfo.currentlyServingToken || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Est. Wait Time</p>
                <p className="font-semibold text-green-700">
                  {queueInfo.estimatedWaitingMinutes ? `${queueInfo.estimatedWaitingMinutes} min` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Report By</p>
                <p className="font-semibold text-green-700">
                  {queueInfo.estimatedReportingTime
                    ? new Date(queueInfo.estimatedReportingTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reason for Visit (if provided) */}
        {appointment.reasonForVisit && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase text-gray-700 mb-2 pb-2 border-b">
              Reason for Visit
            </h2>
            <p className="text-sm text-gray-800">{appointment.reasonForVisit}</p>
          </div>
        )}

        {/* Important Instructions */}
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Important Instructions</h3>
          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
            <li>Arrive 10 minutes before your appointment time</li>
            <li>Bring a valid ID and insurance card if applicable</li>
            <li>Keep this ticket safe for verification at reception</li>
            <li>In case of emergency, call the hospital immediately</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t-2 border-gray-200 mt-8">
          <p className="text-xs text-gray-600 mb-1">
            Generated on {new Date().toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} UpcharGanga. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            For support, visit www.upcharganga.com or call customer service
          </p>
        </div>

        {/* Print-only spacing */}
        <div className="print:hidden text-center text-xs text-gray-500 mt-4">
          💡 Tip: Use Ctrl+P or Cmd+P to print, then save as PDF for email sharing
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-4 {
            padding: 0.5rem !important;
          }
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          .print\\:margin-0 {
            margin: 0 !important;
          }
          @page {
            size: A4;
            margin: 0.5cm;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentTicket;
