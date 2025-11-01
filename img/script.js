document.addEventListener('DOMContentLoaded', () => {
    const designsGrid = document.getElementById('designs-grid');
    const colorModal = document.getElementById('color-modal');
    const designNumberElem = document.getElementById('design-number');
    const designStatusElem = document.getElementById('design-status');
    const designImageElem = document.getElementById('design-image');
    const modalRight = document.querySelector('.modal-right');
    const confirmBtn = document.getElementById('confirm-btn');
    const saveTempBtn = document.getElementById('save-temp-btn');
    const resetBtn = document.getElementById('reset-btn');
    const backBtn = document.getElementById('back-btn');

    let currentDesignId = null;
    const versions = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const colorTypes = ['الخلفية', 'النقشة', 'الحواشي'];

    // إنشاء 60 حاوية عرض تصاميم
    for (let i = 1; i <= 60; i++) {
        const container = document.createElement('div');
        container.classList.add('design-container');
        container.id = `design-${i}`;

        const left = document.createElement('div');
        left.classList.add('design-left');
        if (i === 1) {
            const img = document.createElement('img');
            img.src = `img/${i}.jpg`; // افتراض صورة حقيقية للأولى فقط
            img.alt = `تصميم ${i}`;
            left.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.classList.add('placeholder');
            placeholder.textContent = 'لم يتم الانتهاء من التصميم بعد';
            left.appendChild(placeholder);
        }

        const right = document.createElement('div');
        right.classList.add('design-right');
        const h3 = document.createElement('h3');
        h3.textContent = `تصميم ${i}`;
        const button = document.createElement('button');
        button.textContent = 'قم باختيار الالوان لهذه النقشة';
        button.onclick = () => openModal(i);
        right.appendChild(h3);
        right.appendChild(button);

        container.appendChild(right); // يمين أولاً لأن dir=rtl
        container.appendChild(left); // يسار

        designsGrid.appendChild(container);
    }

    function openModal(id) {
        currentDesignId = id;
        designNumberElem.textContent = `تصميم ${id}`;
        designImageElem.src = id === 2 ? `img/${id}.jpg` : ''; // فقط الأولى لها صورة
        updateStatus(id);
        loadVersions(id);
        colorModal.style.display = 'flex';
    }

    function updateStatus(id) {
        const savedData = JSON.parse(localStorage.getItem(`design-${id}`));
        if (savedData && savedData.sent) {
            designStatusElem.textContent = 'تم الارسال';
        } else if (savedData) {
            designStatusElem.textContent = 'تم الاختيار';
        } else {
            designStatusElem.textContent = 'لم يتم الاختيار';
        }
        const button = document.querySelector(`#design-${id} button`);
        button.textContent = savedData ? 'تعديل الوان هذه النقشة' : 'قم باختيار الالوان لهذه النقشة';
    }

    function loadVersions(id) {
        modalRight.innerHTML = '';
        const savedData = JSON.parse(localStorage.getItem(`design-${id}`)) || {};
        versions.forEach(version => {
            const versionContainer = document.createElement('div');
            versionContainer.classList.add('version-container');

            const header = document.createElement('div');
            header.classList.add('version-header');
            header.textContent = `الاصدار ${version}`;
            versionContainer.appendChild(header);

            const buttons = document.createElement('div');
            buttons.classList.add('version-buttons');
            colorTypes.forEach(type => {
                const btn = document.createElement('button');
                btn.textContent = type;
                btn.onclick = () => {
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = savedData[version]?.[type] || '#ffffff';
                    input.onchange = () => {
                        const display = versionContainer.querySelector(`.display-${type}`);
                        display.querySelector('.color-circle').style.backgroundColor = input.value;
                        display.querySelector('.color-code').textContent = input.value;
                        savedData[version] = savedData[version] || {};
                        savedData[version][type] = input.value;
                    };
                    input.click();
                };
                buttons.appendChild(btn);
            });
            versionContainer.appendChild(buttons);

            const display = document.createElement('div');
            display.classList.add('version-display');
            colorTypes.forEach(type => {
                const disp = document.createElement('div');
                disp.classList.add(`display-${type}`);
                const circle = document.createElement('div');
                circle.classList.add('color-circle');
                circle.style.backgroundColor = savedData[version]?.[type] || '#ffffff';
                const code = document.createElement('span');
                code.classList.add('color-code');
                code.textContent = savedData[version]?.[type] || '#ffffff';
                disp.appendChild(circle);
                disp.appendChild(code);
                display.appendChild(disp);
            });
            versionContainer.appendChild(display);

            modalRight.appendChild(versionContainer);
        });
    }

    confirmBtn.onclick = () => {
        const data = getCurrentData();
        const message = buildMessage(currentDesignId, data);
        const url = `https://wa.me/+967777967272?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        saveData({ ...data, sent: true });
        closeModal();
    };

    saveTempBtn.onclick = () => {
        const data = getCurrentData();
        saveData(data);
        closeModal();
    };

    resetBtn.onclick = () => {
        localStorage.removeItem(`design-${currentDesignId}`);
        loadVersions(currentDesignId);
        updateStatus(currentDesignId);
    };

    backBtn.onclick = closeModal;

    function closeModal() {
        colorModal.style.display = 'none';
        updateStatus(currentDesignId);
    }

    function getCurrentData() {
        const data = {};
        versions.forEach(version => {
            const container = modalRight.querySelectorAll('.version-container')[versions.indexOf(version)];
            colorTypes.forEach((type, idx) => {
                const code = container.querySelectorAll('.color-code')[idx].textContent;
                if (code !== '#ffffff') { // افتراضي، لكن يمكن تخصيص
                    data[version] = data[version] || {};
                    data[version][type] = code;
                }
            });
        });
        return data;
    }

    function saveData(data) {
        localStorage.setItem(`design-${currentDesignId}`, JSON.stringify(data));
    }

    function buildMessage(id, data) {
        let msg = `عزيزي المصمم المبدع صدام .. قم بأعتماد هذه الالوان للتصميم رقم (${id}) : \n_______________`;
        versions.forEach(version => {
            if (data[version]) {
                msg += `\n-- الاصدار ${version} / \n`;
                colorTypes.forEach(type => {
                    msg += `* لون ${type} : ${data[version][type] || '#ffffff'}\n`;
                });
                msg += '-----';
            }
        });
        return msg;
    }
});