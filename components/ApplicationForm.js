import React, { useState } from 'react'

function ApplicationForm({ job, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    locationErnakulam: '',
    workingHours: '',
    experience: ''
  })

  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const generateEmailContent = () => {
    return {
      to: 'sharonindustries@gmail.com',
      subject: `Job Application - ${job.title}`,
      body: `Name: ${formData.name}\nPhone Number: ${formData.phoneNumber}\nLocated in Ernakulam: ${formData.locationErnakulam === 'yes' ? 'Yes' : 'No'}\nWorking Hours (8 AM - 6 PM) Acceptable: ${formData.workingHours === 'yes' ? 'Yes' : 'No'}\nConstruction/Civil Engineering Experience: ${formData.experience}\n\nPosition Applied: ${job.title}`
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all fields are filled
    if (
      !formData.name ||
      !formData.phoneNumber ||
      formData.locationErnakulam === '' ||
      formData.workingHours === '' ||
      !formData.experience
    ) {
      alert('Please fill in all fields')
      return
    }

    // Create email body
    const emailBody = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Phone Number: ${formData.phoneNumber}\n` +
      `Located in Ernakulam: ${formData.locationErnakulam === 'yes' ? 'Yes' : 'No'}\n` +
      `Working Hours (8 AM - 6 PM) Acceptable: ${formData.workingHours === 'yes' ? 'Yes' : 'No'}\n` +
      `Construction/Civil Engineering Experience: ${formData.experience}\n` +
      `\nPosition Applied: ${job.title}`
    )

    // Open email client with prefilled data
    window.location.href = `mailto:sharonindustries@gmail.com?subject=Job%20Application%20-%20${encodeURIComponent(
      job.title
    )}&body=${emailBody}`

    setSubmitted(true)
  }

  const emailContent = generateEmailContent()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-sharon-or px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Apply Now</h2>
            <p className="text-sm text-white text-opacity-75">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white text-opacity-75 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          {submitted ? (
            <div className="space-y-6">
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-2">📧 Open Your Email Client</h3>
                <p className="text-gray-300 mb-4">
                  Your email client should open automatically with your application details. If it doesn't, you can manually copy the information below and send it to us.
                </p>
              </div>

              {/* Manual Email Copy Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Or Send Manually - Copy the Details Below</h3>

                {/* To Field */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Send To:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={emailContent.to}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(emailContent.to)
                        alert('Email address copied!')
                      }}
                      className="px-4 py-2 bg-sharon-or text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Subject Field */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Subject:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={emailContent.subject}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(emailContent.subject)
                        alert('Subject copied!')
                      }}
                      className="px-4 py-2 bg-sharon-or text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Email Body */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Message:</label>
                  <textarea
                    value={emailContent.body}
                    readOnly
                    rows="10"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(emailContent.body)
                      alert('Message copied!')
                    }}
                    className="w-full mt-3 px-4 py-2 bg-sharon-or text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Copy All Message
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-sharon-or text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-600 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Go Back
                </button>
              </div>

              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-gray-200">
                  <strong>Note:</strong> Please ensure all information is correct before sending. We'll get back to you as soon as possible.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Full Name <span className="text-sharon-or">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-sharon-or transition-colors"
                  required
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Phone Number <span className="text-sharon-or">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-sharon-or transition-colors"
                  required
                />
              </div>

              {/* Location Question */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Are you located in Ernakulam? <span className="text-sharon-or">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="locationErnakulam"
                      value="yes"
                      checked={formData.locationErnakulam === 'yes'}
                      onChange={handleInputChange}
                      className="mr-2 w-4 h-4 cursor-pointer"
                      required
                    />
                    <span className="text-gray-300">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="locationErnakulam"
                      value="no"
                      checked={formData.locationErnakulam === 'no'}
                      onChange={handleInputChange}
                      className="mr-2 w-4 h-4 cursor-pointer"
                      required
                    />
                    <span className="text-gray-300">No</span>
                  </label>
                </div>
              </div>

              {/* Working Hours Question */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Are your working hours between 8 AM and 6 PM? Will that be okay for you?{' '}
                  <span className="text-sharon-or">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="workingHours"
                      value="yes"
                      checked={formData.workingHours === 'yes'}
                      onChange={handleInputChange}
                      className="mr-2 w-4 h-4 cursor-pointer"
                      required
                    />
                    <span className="text-gray-300">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="workingHours"
                      value="no"
                      checked={formData.workingHours === 'no'}
                      onChange={handleInputChange}
                      className="mr-2 w-4 h-4 cursor-pointer"
                      required
                    />
                    <span className="text-gray-300">No</span>
                  </label>
                </div>
              </div>

              {/* Experience Question */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  What is your experience in the construction field, or any experience related to
                  civil engineering works? <span className="text-sharon-or">*</span>
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your relevant experience..."
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-sharon-or transition-colors resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-sharon-or text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Your information will be sent to sharonindustries@gmail.com
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationForm
