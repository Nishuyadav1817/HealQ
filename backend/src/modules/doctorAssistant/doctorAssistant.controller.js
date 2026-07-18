const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const doctorAssistantService = require('./doctorAssistant.service');

const getQueue = asyncHandler(async (req, res) => {
  const queueView = await doctorAssistantService.getQueue(
    req.query.doctor,
    req.query.date,
    req.user.hospital,
    req.user.assignedDoctor
  );
  res.status(200).json(new ApiResponse(200, queueView, 'Queue fetched successfully.'));
});

const callNextPatient = asyncHandler(async (req, res) => {
  const { calledEntry, queue } = await doctorAssistantService.callNextPatient(
    req.body.doctor,
    req.body.date,
    req.user.hospital,
    req.user.assignedDoctor
  );
  res.status(200).json(
    new ApiResponse(
      200,
      { calledEntry, currentTokenNumber: queue.currentTokenNumber },
      `Token #${calledEntry.tokenNumber} called.`
    )
  );
});

const startConsultation = asyncHandler(async (req, res) => {
  const { appointment, entry } = await doctorAssistantService.startConsultation(
    req.params.appointmentId,
    req.user.hospital,
    req.user.assignedDoctor
  );
  res
    .status(200)
    .json(new ApiResponse(200, { appointment, entry }, 'Consultation started.'));
});

const completeConsultation = asyncHandler(async (req, res) => {
  const { appointment, entry, averageConsultationMinutes } =
    await doctorAssistantService.completeConsultation(
      req.params.appointmentId,
      req.user.hospital,
      req.user.assignedDoctor
    );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appointment, entry, averageConsultationMinutes },
        'Consultation completed.'
      )
    );
});

const skipPatient = asyncHandler(async (req, res) => {
  const { entry } = await doctorAssistantService.skipPatient(
    req.params.appointmentId,
    req.user.hospital,
    req.user.assignedDoctor
  );
  res.status(200).json(new ApiResponse(200, { entry }, `Token #${entry.tokenNumber} skipped.`));
});

const pauseQueue = asyncHandler(async (req, res) => {
  const queue = await doctorAssistantService.pauseQueue(
    req.body.doctor,
    req.body.date,
    req.user.hospital,
    req.user.assignedDoctor
  );
  res.status(200).json(new ApiResponse(200, { queue }, 'Queue paused.'));
});

const resumeQueue = asyncHandler(async (req, res) => {
  const queue = await doctorAssistantService.resumeQueue(
    req.body.doctor,
    req.body.date,
    req.user.hospital,
    req.user.assignedDoctor
  );
  res.status(200).json(new ApiResponse(200, { queue }, 'Queue resumed.'));
});

const setAverageConsultationTime = asyncHandler(async (req, res) => {
  const { doctor, date, averageConsultationMinutes } = req.body;
  const queue = await doctorAssistantService.setAverageConsultationMinutes(
    doctor,
    date,
    req.user.hospital,
    averageConsultationMinutes,
    req.user.assignedDoctor
  );
  res
    .status(200)
    .json(new ApiResponse(200, { queue }, 'Average consultation time updated; queue recalculated.'));
});

module.exports = {
  getQueue,
  callNextPatient,
  startConsultation,
  completeConsultation,
  skipPatient,
  pauseQueue,
  resumeQueue,
  setAverageConsultationTime,
};
