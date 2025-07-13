import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome, faUser, faSun, faMoon, faChevronDown, faPlus, faCircleCheck, faCode, faPalette, faRocket, faNewspaper, faUsers, faTools, faLock, faFingerprint, faQrcode, faExternalLinkAlt, faEyeSlash, faBars, faTimes, faInfoCircle, faEnvelope, faShield, faGlobe, faEye, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faDiscord, faMarkdown } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'

library.add(faHome, faUser, faSun, faMoon, faChevronDown, faPlus, faCircleCheck, faCode, faPalette, faRocket, faNewspaper, faUsers, faTools, faLock, faFingerprint, faQrcode, faExternalLinkAlt, faEyeSlash, faBars, faTimes, faInfoCircle, faEnvelope, faShield, faGlobe, faEye, faSignOutAlt, faGithub, faDiscord, faMarkdown)
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
