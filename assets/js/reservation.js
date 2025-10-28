const config = {
  apiKey: "YOUR_GOOGLE_API_KEY",
  clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  calendarId: "primary", // Replace with the reservation calendar ID
  discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
  scope: "https://www.googleapis.com/auth/calendar.events"
};

const availabilityList = document.getElementById("availability-list");
const reservationForm = document.getElementById("reservation-form");
const dateInput = document.getElementById("reservation-date");
const timeInput = document.getElementById("reservation-time");

if (dateInput) {
  dateInput.value = new Date().toISOString().split("T")[0];
}

function renderAvailability(slots) {
  availabilityList.innerHTML = "";

  if (!slots.length) {
    availabilityList.innerHTML = "<li class='error'>No open tables for the selected date. Please choose another day.</li>";
    return;
  }

  slots.forEach((slot) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${slot.label}</span>`;

    const button = document.createElement("button");
    button.textContent = "Reserve";
    button.type = "button";
    button.addEventListener("click", () => {
      dateInput.value = slot.date;
      timeInput.value = slot.startTime;
      dateInput.scrollIntoView({ behavior: "smooth" });
    });

    li.appendChild(button);
    availabilityList.appendChild(li);
  });
}

function getAvailabilityFromEvents(events) {
  const slots = [];
  const openingHour = 17; // 5pm
  const closingHour = 23; // 11pm
  const slotLength = 90; // minutes

  const selectedDate = new Date(dateInput.value || new Date());
  selectedDate.setHours(0, 0, 0, 0);

  const dayEvents = events.filter((event) => {
    const eventStart = new Date(event.start.dateTime || event.start.date);
    eventStart.setHours(0, 0, 0, 0);
    return eventStart.getTime() === selectedDate.getTime();
  });

  for (let hour = openingHour; hour < closingHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotLength) {
      const start = new Date(selectedDate);
      start.setHours(hour, minute, 0, 0);
      const end = new Date(start.getTime() + slotLength * 60000);

      const isOverlapping = dayEvents.some((event) => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);
        return start < eventEnd && end > eventStart;
      });

      if (!isOverlapping) {
        slots.push({
          label: `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          date: start.toISOString().split("T")[0],
          startTime: start.toTimeString().slice(0, 5),
          start,
          end
        });
      }
    }
  }

  return slots;
}

function initClient() {
  gapi.client
    .init({
      apiKey: config.apiKey,
      clientId: config.clientId,
      discoveryDocs: config.discoveryDocs,
      scope: config.scope
    })
    .then(() => {
      if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        return gapi.auth2.getAuthInstance().signIn();
      }
      loadAvailability();
    })
    .catch((error) => {
      console.error("Google Calendar init failed", error);
      availabilityList.innerHTML = "<li class='error'>Unable to load availability. Configure the Calendar API credentials.</li>";
    });
}

function loadAvailability() {
  const todayISO = dateInput.value || new Date().toISOString().split("T")[0];
  const timeMin = new Date(todayISO + "T00:00:00");
  const timeMax = new Date(timeMin);
  timeMax.setDate(timeMax.getDate() + 7);

  gapi.client.calendar.events
    .list({
      calendarId: config.calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    })
    .then((response) => {
      const events = response.result.items || [];
      const slots = getAvailabilityFromEvents(events);
      renderAvailability(slots);
    })
    .catch((error) => {
      console.error("Failed to fetch events", error);
      availabilityList.innerHTML = "<li class='error'>Unable to load availability.</li>";
    });
}

function submitReservation(event) {
  event.preventDefault();

  if (!dateInput.value || !timeInput.value) {
    alert("Please choose a date and an available time slot.");
    return;
  }

  const durationMinutes = parseInt(document.getElementById("reservation-duration").value, 10);
  const partySize = document.getElementById("reservation-size").value;
  const name = document.getElementById("reservation-name").value;
  const email = document.getElementById("reservation-email").value;
  const note = document.getElementById("reservation-notes").value;

  const startDateTime = new Date(`${dateInput.value}T${timeInput.value}:00`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

  const eventBody = {
    summary: `Reservation – ${name} (${partySize} guests)`,
    description: note,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "Europe/Amsterdam"
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "Europe/Amsterdam"
    },
    attendees: email ? [{ email }] : []
  };

  gapi.client.calendar.events
    .insert({
      calendarId: config.calendarId,
      resource: eventBody,
      sendUpdates: "all"
    })
    .then(() => {
      alert("Your table is reserved! A confirmation email will arrive shortly.");
      reservationForm.reset();
      if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
      }
      loadAvailability();
    })
    .catch((error) => {
      console.error("Reservation failed", error);
      alert("We could not complete the reservation. Please verify your Google Calendar configuration.");
    });
}

window.addEventListener("load", () => {
  if (window.gapi) {
    gapi.load("client:auth2", initClient);
  }
});

dateInput?.addEventListener("change", loadAvailability);
reservationForm?.addEventListener("submit", submitReservation);