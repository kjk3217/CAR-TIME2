document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const mainScreen = document.getElementById('main-screen');
    const pickupScheduleScreen = document.getElementById('pickup-schedule-screen');
    const dropoffScheduleScreen = document.getElementById('dropoff-schedule-screen');
    const manageScreen = document.getElementById('manage-screen');
    const childFormScreen = document.getElementById('child-form-screen');

    const pickupButton = document.getElementById('pickup-button');
    const dropoffButton = document.getElementById('dropoff-button');
    const manageButton = document.getElementById('manage-button');
    const backButtons = document.querySelectorAll('.back-button');

    const pickupDepartureTimeSpan = document.getElementById('pickup-departure-time');
    const dropoffDepartureTimeSpan = document.getElementById('dropoff-departure-time');
    const pickupList = document.getElementById('pickup-list');
    const dropoffList = document.getElementById('dropoff-list');
    const childManagementList = document.getElementById('child-management-list');

    const setPickupTimeInput = document.getElementById('set-pickup-time');
    const savePickupTimeButton = document.getElementById('save-pickup-time');
    const setDropoffTimeInput = document.getElementById('set-dropoff-time');
    const saveDropoffTimeButton = document.getElementById('save-dropoff-time');
    const addChildButton = document.getElementById('add-child-button');

    const childFormTitle = document.getElementById('child-form-title');
    const childNameInput = document.getElementById('child-name');
    const childPickupTimeInput = document.getElementById('child-pickup-time');
    const childPickupLocationInput = document.getElementById('child-pickup-location');
    const childDropoffTimeInput = document.getElementById('child-dropoff-time');
    const childDropoffLocationInput = document.getElementById('child-dropoff-location');
    const saveChildButton = document.getElementById('save-child-button');
    const pickupTimeError = document.getElementById('pickup-time-error');
    const dropoffTimeError = document.getElementById('dropoff-time-error');

    const confirmPopup = document.getElementById('confirm-popup');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesButton = document.getElementById('confirm-yes');
    const confirmNoButton = document.getElementById('confirm-no');

    const screenLockStatus = document.getElementById('screen-lock-status');

    let editingChildId = null; // 수정 중인 아이의 ID
    let confirmAction = null; // 팝업 확인 시 실행될 함수

    // 로컬스토리지에서 데이터 로드
    let children = JSON.parse(localStorage.getItem('children')) || [];
    let departureTimes = JSON.parse(localStorage.getItem('departureTimes')) || { pickup: '08:00', dropoff: '16:00' };

    // 화면 전환 함수
    function showScreen(screenToShow) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        screenToShow.classList.add('active');
    }

    // 데이터 저장 함수 (로컬스토리지)
    function saveData() {
        localStorage.setItem('children', JSON.stringify(children));
        localStorage.setItem('departureTimes', JSON.stringify(departureTimes));
        updateSchedules();
        renderChildManagementList();
    }

    // 시간표 업데이트 및 렌더링
    function updateSchedules() {
        // 등원 시간표 정렬 및 렌더링 
        const sortedPickupChildren = [...children].sort((a, b) => {
            const timeA = a.pickupTime ? a.pickupTime.replace(':', '') : '9999';
            const timeB = b.pickupTime ? b.pickupTime.replace(':', '') : '9999';
            return timeA.localeCompare(timeB);
        });

        pickupList.innerHTML = '';
        sortedPickupChildren.forEach(child => {
            if (child.pickupTime && child.pickupLocation) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="child-info">
                        <strong>${child.name}</strong>
                        <span>${child.pickupLocation}</span>
                    </div>
                    <span class="child-time">${child.pickupTime}</span>
                `;
                pickupList.appendChild(li);
            }
        });

        // 하원 시간표 정렬 및 렌더링 
        const sortedDropoffChildren = [...children].sort((a, b) => {
            const timeA = a.dropoffTime ? a.dropoffTime.replace(':', '') : '9999';
            const timeB = b.dropoffTime ? b.dropoffTime.replace(':', '') : '9999';
            return timeA.localeCompare(timeB);
        });

        dropoffList.innerHTML = '';
        sortedDropoffChildren.forEach(child => {
            if (child.dropoffTime && child.dropoffLocation) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="child-info">
                        <strong>${child.name}</strong>
                        <span>${child.dropoffLocation}</span>
                    </div>
                    <span class="child-time">${child.dropoffTime}</span>
                `;
                dropoffList.appendChild(li);
            }
        });

        pickupDepartureTimeSpan.textContent = departureTimes.pickup;
        dropoffDepartureTimeSpan.textContent = departureTimes.dropoff;
    }

    // 관리 화면 아이 목록 렌더링
    function renderChildManagementList() {
        childManagementList.innerHTML = '';
        children.forEach(child => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="child-name-display">${child.name}</span>
                <div class="action-buttons">
                    <button class="edit-button" data-id="${child.id}">수정</button>
                    <button class="delete-button" data-id="${child.id}">삭제</button>
                </div>
            `;
            childManagementList.appendChild(li);
        });
    }

    // 시간 유효성 검사 (HH:MM 형식) 
    function isValidTime(time) {
        const regex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
        return regex.test(time);
    }

    // 이벤트 리스너
    pickupButton.addEventListener('click', () => {
        showScreen(pickupScheduleScreen);
        pickupButton.classList.add('ripple');
        setTimeout(() => pickupButton.classList.remove('ripple'), 600);
    });

    dropoffButton.addEventListener('click', () => {
        showScreen(dropoffScheduleScreen);
        dropoffButton.classList.add('ripple');
        setTimeout(() => dropoffButton.classList.remove('ripple'), 600);
    });

    manageButton.addEventListener('click', () => {
        showScreen(manageScreen);
        setPickupTimeInput.value = departureTimes.pickup;
        setDropoffTimeInput.value = departureTimes.dropoff;
        renderChildManagementList();
        manageButton.classList.add('ripple');
        setTimeout(() => manageButton.classList.remove('ripple'), 600);
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            showScreen(mainScreen);
        });
    });

    savePickupTimeButton.addEventListener('click', () => {
        const newTime = setPickupTimeInput.value;
        if (isValidTime(newTime)) {
            departureTimes.pickup = newTime;
            saveData();
            alert('등원 출발 시간이 저장되었습니다.');
        } else {
            alert('올바른 시간 형식(HH:MM)으로 입력해주세요.');
        }
    });

    saveDropoffTimeButton.addEventListener('click', () => {
        const newTime = setDropoffTimeInput.value;
        if (isValidTime(newTime)) {
            departureTimes.dropoff = newTime;
            saveData();
            alert('하원 출발 시간이 저장되었습니다.');
        } else {
            alert('올바른 시간 형식(HH:MM)으로 입력해주세요.');
        }
    });

    addChildButton.addEventListener('click', () => {
        childFormTitle.textContent = '아이 추가';
        editingChildId = null;
        childNameInput.value = '';
        childPickupTimeInput.value = '';
        childPickupLocationInput.value = '';
        childDropoffTimeInput.value = '';
        childDropoffLocationInput.value = '';
        pickupTimeError.textContent = '';
        dropoffTimeError.textContent = '';
        showScreen(childFormScreen);
    });

    // 아이 수정/삭제 이벤트 위임
    childManagementList.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-button')) {
            const idToEdit = event.target.dataset.id;
            const childToEdit = children.find(child => child.id === idToEdit);
            if (childToEdit) {
                childFormTitle.textContent = '아이 수정';
                editingChildId = idToEdit;
                childNameInput.value = childToEdit.name;
                childPickupTimeInput.value = childToEdit.pickupTime || '';
                childPickupLocationInput.value = childToEdit.pickupLocation || '';
                childDropoffTimeInput.value = childToEdit.dropoffTime || '';
                childDropoffLocationInput.value = childToEdit.dropoffLocation || '';
                pickupTimeError.textContent = '';
                dropoffTimeError.textContent = '';
                showScreen(childFormScreen);
            }
        } else if (event.target.classList.contains('delete-button')) {
            const idToDelete = event.target.dataset.id;
            showConfirmPopup('정말로 이 아이를 삭제하시겠습니까?', () => {
                children = children.filter(child => child.id !== idToDelete);
                saveData();
            });
        }
    });

    saveChildButton.addEventListener('click', () => {
        const name = childNameInput.value.trim();
        const pickupTime = childPickupTimeInput.value.trim();
        const pickupLocation = childPickupLocationInput.value.trim();
        const dropoffTime = childDropoffTimeInput.value.trim();
        const dropoffLocation = childDropoffLocationInput.value.trim();

        let hasError = false;

        // 이름 필드는 비워둘 수 없음
        if (!name) {
            alert('이름을 입력해주세요.');
            return;
        }

        // 시간 유효성 검사 및 오류 메시지 표시 
        if (pickupTime && !isValidTime(pickupTime)) {
            pickupTimeError.textContent = '올바른 시간 형식(HH:MM)으로 입력해주세요.';
            hasError = true;
        } else {
            pickupTimeError.textContent = '';
        }

        if (dropoffTime && !isValidTime(dropoffTime)) {
            dropoffTimeError.textContent = '올바른 시간 형식(HH:MM)으로 입력해주세요.';
            hasError = true;
        } else {
            dropoffTimeError.textContent = '';
        }

        if (hasError) {
            return;
        }

        if (editingChildId) {
            // 수정
            const childIndex = children.findIndex(child => child.id === editingChildId);
            if (childIndex > -1) {
                children[childIndex] = {
                    ...children[childIndex],
                    name,
                    pickupTime,
                    pickupLocation,
                    dropoffTime,
                    dropoffLocation
                };
            }
        } else {
            // 추가
            const newChild = {
                id: Date.now().toString(), // 고유 ID 생성
                name,
                pickupTime,
                pickupLocation,
                dropoffTime,
                dropoffLocation
            };
            children.push(newChild);
        }
        saveData();
        showScreen(manageScreen);
    });

    // 확인 팝업 표시 함수
    function showConfirmPopup(message, action) {
        confirmMessage.textContent = message;
        confirmAction = action;
        confirmPopup.classList.add('active');
    }

    // 확인 팝업 닫기 함수
    function hideConfirmPopup() {
        confirmPopup.classList.remove('active');
        confirmAction = null;
    }

    confirmYesButton.addEventListener('click', () => {
        if (confirmAction) {
            confirmAction();
        }
        hideConfirmPopup();
    });

    confirmNoButton.addEventListener('click', () => {
        hideConfirmPopup();
    });

    // 화면 깨우기 (Wake Lock API) 
    let wakeLock = null;

    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                screenLockStatus.textContent = '✅ 화면 잠금 방지 활성화됨';
                wakeLock.addEventListener('release', () => {
                    console.log('Screen Wake Lock released:', wakeLock.released);
                    screenLockStatus.textContent = '❌ 화면 잠금 방지 비활성화됨';
                });
                console.log('Screen Wake Lock is active!');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
                screenLockStatus.textContent = '❌ 화면 잠금 방지 오류';
            }
        } else {
            screenLockStatus.textContent = '🚫 화면 잠금 방지 미지원';
        }
    };

    const releaseWakeLock = () => {
        if (wakeLock) {
            wakeLock.release();
            wakeLock = null;
        }
    };

    // 앱이 활성화될 때 Wake Lock 요청
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }
    });

    // 앱 로드 시 초기화
    updateSchedules();
    renderChildManagementList();
    requestWakeLock(); // 초기 로드 시에도 Wake Lock 요청
});
