import Table from '../../components/Table'
import StatusBadge from '../../components/StatusBadge'
// import { formatDate } from '../../utils/formatDate'
import { formatDate } from '../../utils/formatData'
import { DOCTORS } from '../../utils/constants'

const doctorMap = DOCTORS.reduce((acc, doctor) => {
  acc[doctor.id] = doctor.name
  return acc
}, {})

function AppointmentTable({ appointments, patients }) {
  const formatTime = (value) => {
    if (!value) return '-'
    return String(value).slice(0, 5)
  }

  const patientMap = patients.reduce((acc, patient) => {
    acc[patient.id || patient._id] = patient.name
    return acc
  }, {})

  const columns = [
    {
      key: 'patientName',
      title: 'Patient Name',
      render: (row) => patientMap[row.patientId] || row.patientName || '-',
    },
    {
      key: 'doctorName',
      title: 'Doctor Name',
      render: (row) => doctorMap[row.doctorId] || row.doctorName || '-',
    },
    {
      key: 'date',
      title: 'Date',
      render: (row) => formatDate(row.date),
    },
    {
      key: 'time',
      title: 'Time',
      render: (row) => formatTime(row.time),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <Table
      columns={columns}
      data={appointments}
      emptyText="No appointments available"
    />
  )
}

export default AppointmentTable
