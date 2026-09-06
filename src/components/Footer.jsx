function Footer() {
  return (
    <footer className="bg-dark text-white mt-auto border-top border-secondary border-opacity-25">
      <div className="container py-4">
        <div className="row align-items-center g-3">
          
          <div className="col-12 col-md-4 text-center text-md-start">
            <h5 className="fw-bold mb-1">
              🧠 Edu<span className="text-primary">AI</span>
            </h5>
            <small className="text-white-50">
              Smart learning powered by Artificial Intelligence.
            </small>
          </div>

          <div className="col-12 col-md-4 text-center">
            <span className="badge bg-secondary bg-opacity-25 border border-secondary text-light px-3 py-2 rounded-pill small">
              Crafted with ❤️ by <strong className="text-primary">Arjun Singh</strong>
            </span>
          </div>

          <div className="col-12 col-md-4 text-center text-md-end">
            <small className="text-white-50">
              © 2026 EduAI. All Rights Reserved.
            </small>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;