export const validatePatientForm = (values) => {
  const errors = {}

  if (!values.name.trim()) errors.name = 'Name is required'

  if (!values.age || Number(values.age) <= 0 || Number(values.age) > 120) {
    errors.age = 'Enter a valid age between 1 and 120'
  }

  if (!values.gender) errors.gender = 'Gender is required'

  const contactRegex = /^[6-9]\d{9}$/
  if (!values.contact.trim()) {
    errors.contact = 'Contact is required'
  } else if (!contactRegex.test(values.contact.trim())) {
    errors.contact = 'Enter a valid 10-digit contact number'
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!values.bloodGroup) errors.bloodGroup = 'Blood group is required'
  
  if (!values.address?.trim()) errors.address = 'Address is required'

  return errors
}

export const validateAppointmentForm = (values) => {
  const errors = {}

  if (!values.patientId) errors.patientId = 'Patient is required'
  if (!values.doctorId) errors.doctorId = 'Doctor is required'
  if (!values.date) errors.date = 'Date is required'
  if (!values.time) errors.time = 'Time is required'
  if (!values.status) errors.status = 'Status is required'

  return errors
}
