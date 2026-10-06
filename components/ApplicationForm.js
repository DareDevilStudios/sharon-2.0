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
    setTimeout(() => {
      onClose()
      setSubmitted(false)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-sharon-grey rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-sharon-or to-orange-600 px-6 py-4 flex justify-between items-center border-b border-sharon-grey">
          <div>
            <h2 className="text-2xl font-bold text-black">Apply Now</h2>
            <p className="text-sm text-black text-opacity-75">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-black text-opacity-75 hover:text-black text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-sharon-or mb-2">Thank You!</h3>
              <p className="text-gray-400">
                Your application has been sent to sharonindustries@gmail.com
              </p>
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
                  className="w-full px-4 py-2 bg-gray-800 border border-sharon-grey text-white rounded-lg focus:outline-none focus:border-sharon-or transition-colors"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-sharon-grey text-white rounded-lg focus:outline-none focus:border-sharon-or transition-colors"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-sharon-grey text-white rounded-lg focus:outline-none focus:border-sharon-or transition-colors resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-sharon-or text-black font-bold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-sharon-grey text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2">
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
