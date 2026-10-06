import React, { useState } from 'react'
import Link from 'next/link'
import ApplicationForm from './ApplicationForm'

function CareerSection() {
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  const jobs = [
    {
      id: 1,
      title: "Manufacturing Supervisor",
      department: "Manufacturing & Operations",
      location: "Kanjiramattom, Ernakulam",
      type: "Full-Time",
      workingHours: "8:00 AM - 6:00 PM",
      responsibilities: [
        "Manage day-to-day manufacturing operations and workflow",
        "Oversee production teams and ensure quality standards are met",
        "Conduct sales activities and client liaisons",
        "Manage operational flows and ensure efficient production",
        "Monitor equipment maintenance and workplace safety",
        "Coordinate with management on production schedules and targets",
        "Maintain records and prepare production reports"
      ],
      requirements: [
        "Bachelor's degree in Civil Engineering or related field",
        "Prior experience in construction or manufacturing (internship or professional experience preferred)",
        "Strong leadership and team management skills",
        "Excellent communication and organizational abilities",
        "Knowledge of manufacturing processes and safety protocols",
        "Ability to work in a fast-paced environment"
      ],
      preferredQualifications: [
        "2+ years of experience in manufacturing or construction supervision",
        "Knowledge of concrete products manufacturing",
        "Experience with production management software",
        "OSHA or similar safety certification"
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
      {/* Application Form Modal */}
      {showApplicationForm && (
        <ApplicationForm 
          job={selectedJob} 
          onClose={() => setShowApplicationForm(false)} 
        />
      )}

      <div className="w-full bg-black pt-20 pb-12">
        {/* Header Section */}
        <div className="w-full px-4 md:px-8 py-12 bg-gradient-to-b from-sharon-or to-black">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-200 mb-6">
              Be part of Sharon Industries and contribute to building exceptional concrete solutions
            </p>
            <p className="text-lg text-gray-300">
              We're looking for talented professionals to grow with us. Check out the opportunities below.
            </p>
          </div>
        </div>

        {/* Job Listings Section */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <h2 className="text-4xl font-bold text-white mb-4">Open Positions</h2>
          <p className="text-gray-400 mb-12">Currently hiring for the following roles:</p>

          {/* Job Card */}
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-gray-900 border border-sharon-grey rounded-lg overflow-hidden hover:border-sharon-or transition-colors">
                {/* Job Header - Always Visible */}
                <div 
                  className="p-6 md:p-8 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => toggleExpand(job.id)}
                >
                  <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 mb-2">
                        <div className="flex items-center text-gray-400">
                          <svg className="w-5 h-5 mr-2 text-sharon-or" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2a1 1 0 001 1h1v5a2 2 0 002 2h6a2 2 0 002-2v-5h1a1 1 0 001-1V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {job.department}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <svg className="w-5 h-5 mr-2 text-sharon-or" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {job.location}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <svg className="w-5 h-5 mr-2 text-sharon-or" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2a1 1 0 001 1h1v5a2 2 0 002 2h6a2 2 0 002-2v-5h1a1 1 0 001-1V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {job.type}
                        </div>
                      </div>
                      <div className="flex items-center text-sharon-or font-semibold">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />
                        </svg>
                        {job.workingHours}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="px-6 py-2 bg-sharon-or text-black font-bold rounded-lg hover:bg-orange-600 transition-colors">
                        {expandedJobId === job.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                {expandedJobId === job.id && (
                  <div className="border-t border-sharon-grey px-6 md:px-8 py-8 bg-gray-800 bg-opacity-50">
                    {/* Responsibilities */}
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-sharon-or mb-4">Key Responsibilities</h4>
                      <ul className="space-y-3">
                        {job.responsibilities.map((responsibility, index) => (
                          <li key={index} className="flex items-start text-gray-300">
                            <span className="text-sharon-or mr-3 mt-1">✓</span>
                            <span>{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-sharon-or mb-4">Requirements</h4>
                      <ul className="space-y-3">
                        {job.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start text-gray-300">
                            <span className="text-sharon-or mr-3 mt-1">•</span>
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Preferred Qualifications */}
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-sharon-or mb-4">Preferred Qualifications</h4>
                      <ul className="space-y-3">
                        {job.preferredQualifications.map((qualification, index) => (
                          <li key={index} className="flex items-start text-gray-300">
                            <span className="text-sharon-or mr-3 mt-1">⭐</span>
                            <span>{qualification}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Application Button */}
                    <div className="border-t border-sharon-grey pt-8 mt-8">
                      <button
                        onClick={() => handleApplyClick(job)}
                        className="px-8 py-3 bg-sharon-or text-black font-bold rounded-lg hover:bg-orange-600 transition-colors"
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

        {/* Why Join Us Section */}
        <div className="bg-gray-900 mt-16 py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Join Sharon Industries?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Growing Company",
                  description: "Be part of a rapidly expanding concrete manufacturing enterprise with exciting growth opportunities.",
                  icon: "📈"
                },
                {
                  title: "Competitive Compensation",
                  description: "Attractive salary and benefits package commensurate with experience and qualifications.",
                  icon: "💰"
                },
                {
                  title: "Professional Development",
                  description: "Opportunities to enhance your skills and advance your career in the manufacturing industry.",
                  icon: "🎓"
                },
                {
                  title: "Dynamic Work Environment",
                  description: "Work with modern equipment and a collaborative team dedicated to excellence.",
                  icon: "🏭"
                },
                {
                  title: "Health & Safety",
                  description: "Commitment to maintaining safe working conditions and employee well-being.",
                  icon: "🛡️"
                },
                {
                  title: "Work-Life Balance",
                  description: "Structured working hours and a supportive work environment.",
                  icon: "⚖️"
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-black border border-sharon-grey rounded-lg p-6 hover:border-sharon-or transition-colors">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-sharon-or mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
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
