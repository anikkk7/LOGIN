const views = {
  loginView: document.getElementById("loginView"),
  forgotView: document.getElementById("forgotView"),
  otpView: document.getElementById("otpView"),
};

const panelTitle = document.getElementById("panelTitle");
const statusPill = document.getElementById("statusPill");
const feedbackBox = document.getElementById("feedbackBox");
const feedbackText = document.getElementById("feedbackText");
const togglePassword = document.getElementById("togglePassword");
const loginPassword = document.getElementById("loginPassword");
const otpInputs = [...document.querySelectorAll(".otp-input")];
const otpPreview = document.getElementById("otpPreview");
const otpInstruction = document.getElementById("otpInstruction");
const resendOtpButton = document.getElementById("resendOtp");
const otpTimer = document.getElementById("otpTimer");
const cursorGlow = document.getElementById("cursorGlow");
const trailLayer = document.getElementById("trailLayer");
const tiltPanels = document.querySelectorAll(".tilt-panel");

let generatedOtp = "";
let resendCountdown = 30;
let resendInterval = null;
let recoveryTarget = "";
let trailThrottle = false;

const viewMeta = {
  loginView: { title: "Welcome back", status: "Ready" },
  forgotView: { title: "Recover access", status: "Recovery" },
  otpView: { title: "Verify OTP", status: "Secure Check" },
};

function setFeedback(message, type = "default") {
  feedbackText.textContent = message;
  feedbackBox.classList.remove("is-success", "is-error");

  if (type === "success") {
    feedbackBox.classList.add("is-success");
  }

  if (type === "error") {
    feedbackBox.classList.add("is-error");
  }
}

function switchView(targetId) {
  Object.entries(views).forEach(([viewId, viewEl]) => {
    viewEl.classList.toggle("is-active", viewId === targetId);
  });

  panelTitle.textContent = viewMeta[targetId].title;
  statusPill.textContent = viewMeta[targetId].status;
}

function generateOtp() {
  generatedOtp = `${Math.floor(100000 + Math.random() * 900000)}`;
  otpPreview.textContent = generatedOtp;
}

function startResendTimer() {
  clearInterval(resendInterval);
  resendCountdown = 30;
  resendOtpButton.disabled = true;
  otpTimer.textContent = `Resend available in ${resendCountdown}s`;

  resendInterval = setInterval(() => {
    resendCountdown -= 1;

    if (resendCountdown <= 0) {
      clearInterval(resendInterval);
      resendOtpButton.disabled = false;
      otpTimer.textContent = "You can resend the OTP now";
      return;
    }

    otpTimer.textContent = `Resend available in ${resendCountdown}s`;
  }, 1000);
}

function resetOtpInputs() {
  otpInputs.forEach((input) => {
    input.value = "";
  });
  otpInputs[0].focus();
}

function createTrailDot(x, y) {
  const trailDot = document.createElement("span");
  trailDot.className = "trail-dot";
  trailDot.style.left = `${x}px`;
  trailDot.style.top = `${y}px`;
  trailLayer.appendChild(trailDot);

  window.setTimeout(() => {
    trailDot.remove();
  }, 800);
}

document.querySelectorAll("[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    switchView(button.dataset.target);
    setFeedback("Switched panels. Continue with the next step.");
  });
});

togglePassword.addEventListener("click", () => {
  const showPassword = loginPassword.type === "password";
  loginPassword.type = showPassword ? "text" : "password";
  togglePassword.textContent = showPassword ? "Hide" : "Show";
});

views.loginView.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = loginPassword.value.trim();
  const rememberMe = document.getElementById("rememberMe").checked;

  if (!email || !password) {
    setFeedback("Please enter both email and password to sign in.", "error");
    return;
  }

  const personalizedMessage = rememberMe
    ? `Welcome back. Your session for ${email} can be remembered on this device.`
    : `Welcome back. ${email} has passed the demo login check.`;

  setFeedback(personalizedMessage, "success");
});

views.forgotView.addEventListener("submit", (event) => {
  event.preventDefault();

  const recoveryEmail = document.getElementById("recoveryEmail").value.trim();

  if (!recoveryEmail) {
    setFeedback("Enter your email first so we know where to send the OTP.", "error");
    return;
  }

  recoveryTarget = recoveryEmail;
  generateOtp();
  startResendTimer();
  resetOtpInputs();
  otpInstruction.textContent = `Enter the 6-digit OTP sent to ${recoveryTarget}.`;
  switchView("otpView");
  setFeedback(`A demo OTP has been generated for ${recoveryTarget}. Use the code shown below to verify.`, "success");
});

views.otpView.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredOtp = otpInputs.map((input) => input.value).join("");

  if (enteredOtp.length !== 6) {
    setFeedback("Please enter the full 6-digit OTP.", "error");
    return;
  }

  if (enteredOtp !== generatedOtp) {
    setFeedback("That OTP is incorrect. Double-check the code or request a new one.", "error");
    return;
  }

  setFeedback(`OTP verified for ${recoveryTarget}. You can now continue to reset the password in a real backend flow.`, "success");
  switchView("loginView");
});

resendOtpButton.addEventListener("click", () => {
  generateOtp();
  startResendTimer();
  resetOtpInputs();
  setFeedback(`A new OTP has been generated for ${recoveryTarget}.`, "success");
});

otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);

    if (input.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedValue = (event.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, otpInputs.length);

    pastedValue.split("").forEach((digit, digitIndex) => {
      if (otpInputs[digitIndex]) {
        otpInputs[digitIndex].value = digit;
      }
    });

    const nextIndex = Math.min(pastedValue.length, otpInputs.length - 1);
    otpInputs[nextIndex].focus();
  });
});

document.addEventListener("pointermove", (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;

  if (!trailThrottle) {
    createTrailDot(event.clientX, event.clientY);
    trailThrottle = true;

    window.setTimeout(() => {
      trailThrottle = false;
    }, 35);
  }
});

tiltPanels.forEach((panel) => {
  panel.addEventListener("pointermove", (event) => {
    if (window.innerWidth <= 640) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
    const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
    panel.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });

  panel.addEventListener("pointerleave", () => {
    panel.style.transform = "";
  });
});

setFeedback("Use the flow to test login, recovery, and OTP verification.");
