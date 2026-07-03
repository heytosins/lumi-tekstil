const contactForm = document.querySelector('.contactForm');
const formInputs = document.querySelectorAll('.formInput');
const nameInput = document.querySelector('input[name="name"]');
const emailInput = document.querySelector('input[name="email"]');
const phoneInput = document.querySelector('input[name="phone"]');
const messageInput = document.querySelector('textarea[name="message"]');
const checkbox = document.querySelector('.formCheckbox');
const checkboxLabel = document.querySelector('.checkboxLabel');
const formButton = document.querySelector('.formButton');
const contactSuccess = document.querySelector('.contactSuccess');
let successResetTimeoutId = null;
let submitInProgress = false;

if (phoneInput) {
  phoneInput.setAttribute('inputmode', 'numeric');
  phoneInput.setAttribute('maxlength', '12');
}

const validationMessages = {
  name: 'İsim soyisim alanında sayı kullanılamaz ve ad ile soyad arasında 1 veya 2 boşluk olmalıdır.',
  email: 'Geçerli bir e-posta girin. @ işareti ve .com veya .net uzantısı zorunludur.',
  phone: 'Telefon numarası sadece rakamlardan oluşmalı ve en fazla 12 hane olmalıdır.',
  message: 'Mesaj alanı boş bırakılamaz ve en az 25 karakter olmalıdır.'
};

const namePattern = /^[A-Za-zÇĞİÖŞÜçğıöşü]+(?:[ ]{1,2}[A-Za-zÇĞİÖŞÜçğıöşü]+)+$/;
const emailPattern = /^[^\s@]+@(gmail|outlook|hotmail)\.(com|net)$/i;

const getFieldError = (input) => {
  const value = input.value.trim();

  if (input === nameInput) {
    if (!value) return validationMessages.name;
    if (/\d/.test(value)) return validationMessages.name;
    if (!namePattern.test(value)) return validationMessages.name;
    return '';
  }

  if (input === emailInput) {
    if (!value) return validationMessages.email;
    if (!emailPattern.test(value)) return validationMessages.email;
    return '';
  }

  if (input === phoneInput) {
    if (!value) return validationMessages.phone;
    if (!/^\d{1,12}$/.test(value)) return validationMessages.phone;
    return '';
  }

  if (input === messageInput) {
    if (value.length < 25) return validationMessages.message;
    return '';
  }

  return '';
};

const syncFieldValidity = (input) => {
  if (input === phoneInput) {
    input.value = input.value.replace(/\D/g, '').slice(0, 12);
  }

  const error = getFieldError(input);
  input.setCustomValidity(error);
  const shouldShowError = input.dataset.dirty === 'true' || input.dataset.showError === 'true';

  if (shouldShowError) {
    input.classList.toggle('invalid', Boolean(error));
  } else {
    input.classList.remove('invalid');
  }
};

formInputs.forEach((input) => {
  input.addEventListener('input', () => {
    input.dataset.dirty = 'true';
    syncFieldValidity(input);
  });
});

formInputs.forEach((input) => {
  input.dataset.dirty = 'false';
  input.dataset.showError = 'false';
  syncFieldValidity(input);
});

const setInputFocus = (input) => {
  input.addEventListener('focus', () => {
    input.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    input.classList.remove('focused');
    syncFieldValidity(input);
  });
};

formInputs.forEach(setInputFocus);

const validateForm = () => {
  let valid = true;

  formInputs.forEach((input) => {
    input.dataset.showError = 'true';
    syncFieldValidity(input);

    if (!input.checkValidity()) {
      input.classList.add('invalid');
      valid = false;
    } else {
      input.classList.remove('invalid');
    }
  });

  if (!checkbox.checked) {
    checkboxLabel.classList.add('invalid');
    valid = false;
  } else {
    checkboxLabel.classList.remove('invalid');
  }

  return valid;
};

const resetSuccessState = () => {
  contactSuccess.classList.remove('active');
  contactForm.classList.remove('submitted');
  contactForm.reset();

  formInputs.forEach((input) => {
    input.dataset.dirty = 'false';
    input.dataset.showError = 'false';
    input.classList.remove('invalid');
    input.setCustomValidity('');
    syncFieldValidity(input);
  });

  checkboxLabel.classList.remove('invalid');
};

const setSubmitState = (isSubmitting) => {
  submitInProgress = isSubmitting;
  formButton.disabled = isSubmitting;
  formButton.textContent = isSubmitting ? 'Gönderiliyor...' : 'Kaydet';
};

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  if (submitInProgress) {
    return;
  }

  setSubmitState(true);

  try {
    const response = await fetch('https://project-lumipha.onrender.com/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        message: messageInput.value.trim(),
        agreement: checkbox.checked,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.message || 'Mesaj gönderilemedi.');
    }

    contactSuccess.classList.add('active');
    contactForm.classList.add('submitted');
    contactSuccess.setAttribute('aria-hidden', 'false');

    if (successResetTimeoutId) {
      clearTimeout(successResetTimeoutId);
    }

    successResetTimeoutId = window.setTimeout(() => {
      resetSuccessState();
      contactSuccess.setAttribute('aria-hidden', 'true');
    }, 10000);
  } catch (error) {
    window.alert(error.message || 'Mesaj gönderilemedi.');
  } finally {
    setSubmitState(false);
  }
});

formButton.addEventListener('mousedown', () => {
  formButton.classList.add('pressed');
});

formButton.addEventListener('mouseup', () => {
  formButton.classList.remove('pressed');
});

formButton.addEventListener('mouseleave', () => {
  formButton.classList.remove('pressed');
});

checkbox.addEventListener('change', () => {
  checkboxLabel.classList.toggle('invalid', !checkbox.checked);
});

const productContainers = document.querySelectorAll('.productContainer');
productContainers.forEach((container) => {
  const image = container.querySelector('img');
  if (!image || !image.dataset.hover) return;

  const originalSrc = image.src;
  const hoverSrc = image.dataset.hover;

  container.addEventListener('mouseenter', () => {
    image.style.transition = 'none';
    image.style.opacity = '0';
    setTimeout(() => {
      image.src = hoverSrc;
      image.style.transition = 'opacity 0.6s ease';
      image.style.opacity = '1';
    }, 0);
  });

  container.addEventListener('mouseleave', () => {
    image.style.transition = 'none';
    image.style.opacity = '0';
    setTimeout(() => {
      image.src = originalSrc;
      image.style.transition = 'opacity 0.6s ease';
      image.style.opacity = '1';
    }, 0);
  });
});

const featureContainers = document.querySelectorAll('.featureContainer');
featureContainers.forEach((container) => {
  const icon = container.querySelector('img');
  if (!icon) return;

  const originalSrc = icon.src;
  const blackSrc = originalSrc.replace(/(\.svg)$/i, 'Black$1');

  container.addEventListener('mouseenter', () => {
    icon.style.opacity = '0';
    setTimeout(() => {
      icon.src = blackSrc;
      icon.style.opacity = '1';
    }, 150);
  });

  container.addEventListener('mouseleave', () => {
    icon.style.opacity = '0';
    setTimeout(() => {
      icon.src = originalSrc;
      icon.style.opacity = '1';
    }, 150);
  });
});