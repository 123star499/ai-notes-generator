import { useState } from "react"

function Home() {
  const [topic, setTopic] = useState("")
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">

          {/* Hero Section */}
          <div className="text-center mb-5">

            <div className="mb-3">
              <span className="badge text-bg-primary px-3 py-2 rounded-pill">
                ✨ AI Powered Learning
              </span>
            </div>

            <h1 className="display-4 fw-bold">
              AI Notes Generator
            </h1>

            <p className="lead text-secondary mx-auto" style={{ maxWidth: "700px" }}>
              Generate clear, structured and easy-to-understand study notes
              instantly using Artificial Intelligence.
            </p>

          </div>

          {/* Generator Card */}
          <div className="card border-0 shadow-lg rounded-4">

            <div className="card-body p-4 p-md-5">

              <h3 className="fw-bold mb-2">
                Generate Your Notes
              </h3>

              <p className="text-secondary mb-4">
                Enter any topic and let AI create study material for you.
              </p>

              {/* Topic */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Enter Topic
                </label>

                <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Example: Normalization in DBMS"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Options */}
              <div className="row g-3">

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Difficulty Level
                  </label>

                  <select className="form-select form-select-lg">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>

                </div>

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Notes Type
                  </label>

                  <select className="form-select form-select-lg">
                    <option>Detailed Notes</option>
                    <option>Short Notes</option>
                    <option>Summary</option>
                    <option>Important Questions</option>
                    <option>MCQs</option>
                  </select>

                </div>

              </div>

              {/* Generate Button */}
              <div className="d-grid mt-4">

                <button
                className="btn btn-primary btn-lg rounded-3 py-3"
                onClick={() => {
                    console.log("Topic:", topic)
                }}
                >
                ✨ Generate Notes
                </button>

              </div>

            </div>
          </div>

          {/* Features */}
          <div className="row g-4 mt-4">

            <div className="col-12 col-md-4">
              <div className="text-center p-4">
                <div className="fs-1 mb-2">📚</div>
                <h5 className="fw-bold">Smart Notes</h5>
                <p className="text-secondary mb-0">
                  Generate structured notes on any topic.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="text-center p-4">
                <div className="fs-1 mb-2">🧠</div>
                <h5 className="fw-bold">AI Powered</h5>
                <p className="text-secondary mb-0">
                  Get easy-to-understand AI generated content.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="text-center p-4">
                <div className="fs-1 mb-2">⚡</div>
                <h5 className="fw-bold">Instant Results</h5>
                <p className="text-secondary mb-0">
                  Generate your study material within seconds.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default Home