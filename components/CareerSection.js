import React, { useState } from 'react'
import ApplicationForm from './ApplicationForm'

function CareerSection() {
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  const jobs = [
    {
      id: 1,
      title: 'Manufacturing Supervisor',
      department: 'Manufacturing & Operations',
      location: 'Kanjiramattom, Ernakulam',
      type: 'Full-Time',
      workingHours: '8:00 AM - 6:00 PM',
      responsibilities: [
        'Manage day-to-day manufacturing operations and workflow',
        'Oversee production teams and ensure quality standards are met',
        'Conduct sales activities and client liaisons',
        'Manage operational flows and ensure efficient production',
        'Monitor equipment maintenance and workplace safety',
        'Coordinate with management on production schedules and targets',
        'Maintain records and prepare production reports'
      ],
      requirements: [
        "Bachelor's degree in Civil Engineering or related field",
        'Prior experience in construction or manufacturing (internship or professional experience preferred)',
        'Strong leadership and team management skills',
        'Excellent communication and organizational abilities',
        'Knowledge of manufacturing processes and safety protocols',
        'Ability to work in a fast-paced environment'
      ]
    }
  ]

  const toggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  const handleApplyClick = (job) => {
    setSelectedJob(job)
    setShowApplicationForm(true)
  }

  return (
    <>
      {showApplicationForm && (
        <ApplicationForm
          job={selectedJob}
          onClose={() => setShowApplicationForm(false)}
        />
      )}

      <div className="w-full bg-black pt-20 pb-12 text-white">
        <div className="w-full px-4 md:px-8 py-12 border-b border-gray-800 bg-black">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm uppercase tracking-[0.2em] text-sharon-or mb-4">Career</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Join Our Team</h1>
            <p className="text-lg text-gray-300 max-w-3xl">
              Be part of Sharon Industries and contribute to building exceptional concrete solutions.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Open Positions</h2>
          <p className="text-gray-400 mb-10">Currently hiring for the following role:</p>

          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                <div
                  className="p-6 md:p-8 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => toggleExpand(job.id)}
                >
                  <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-300">
                        <div className="flex items-center">
                          <span className="text-sharon-or mr-2">•</span>
                          {job.department}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sharon-or mr-2">•</span>
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sharon-or mr-2">•</span>
                          {job.type}
                        </div>
                      </div>
                      <div className="flex items-center text-sharon-or font-medium text-sm md:text-base">
                        <span className="mr-2">⏰</span>
                        {job.workingHours}
                      </div>
                    </div>

                    <button className="px-6 py-3 bg-sharon-or text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">
                      {expandedJobId === job.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {expandedJobId === job.id && (
                  <div className="border-t border-gray-700 px-6 md:px-8 py-8 bg-[#111111]">
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-white mb-4">Key Responsibilities</h4>
                      <ul className="space-y-3">
                        {job.responsibilities.map((responsibility, index) => (
                          <li key={index} className="flex items-start text-gray-300">
                            <span className="text-sharon-or mr-3 mt-1">✓</span>
                            <span>{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-white mb-4">Requirements</h4>
                      <ul className="space-y-3">
                        {job.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start text-gray-300">
                            <span className="text-sharon-or mr-3 mt-1">•</span>
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-gray-700 pt-8 mt-8">
                      <button
                        onClick={() => handleApplyClick(job)}
                        className="px-8 py-3 bg-sharon-or text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Apply for this Job
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] mt-8 py-12 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">Why Join Sharon Industries?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Growing Company',
                  description: 'Be part of a rapidly expanding concrete manufacturing enterprise with exciting growth opportunities.',
                  icon: '📈'
                },
                {
                  title: 'Competitive Compensation',
                  description: 'Attractive salary and benefits package commensurate with experience and qualifications.',
                  icon: '💰'
                },
                {
                  title: 'Professional Development',
                  description: 'Opportunities to enhance your skills and advance your career in the manufacturing industry.',
                  icon: '🎓'
                },
                {
                  title: 'Dynamic Work Environment',
                  description: 'Work with modern equipment and a collaborative team dedicated to excellence.',
                  icon: '🏭'
                },
                {
                  title: 'Health & Safety',
                  description: 'Commitment to maintaining safe working conditions and employee well-being.',
                  icon: '🛡️'
                },
                {
                  title: 'Work-Life Balance',
                  description: 'Structured working hours and a supportive work environment.',
                  icon: '⚖️'
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-black border border-gray-700 rounded-lg p-6">
                  <div className="text-3xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-sharon-or mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CareerSection
