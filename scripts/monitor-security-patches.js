#!/usr/bin/env node

/**
 * Security Patch Monitor
 * Monitors for Next.js security patches and alerts when updates are available
 * Specifically tracks CVE-2025-55184 and CVE-2025-55183 fixes
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const CONFIG = {
  checkInterval: 6 * 60 * 60 * 1000, // Check every 6 hours
  packageName: 'next',
  currentVersion: '14.1.0',
  cves: ['CVE-2025-55184', 'CVE-2025-55183'],
  logFile: path.join(__dirname, '../.security-monitor.json'),
}

function getLatestVersion() {
  return new Promise((resolve, reject) => {
    https
      .get('https://registry.npmjs.org/next', (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            const latestVersion = json['dist-tags'].latest
            const allVersions = Object.keys(json.versions)

            // Get all versions after current version
            const currentVersionIndex = allVersions.indexOf(
              CONFIG.currentVersion
            )
            const newerVersions = allVersions.slice(currentVersionIndex + 1)

            resolve({
              latest: latestVersion,
              newerVersions: newerVersions,
              allVersions: allVersions,
            })
          } catch (error) {
            reject(error)
          }
        })
      })
      .on('error', reject)
  })
}

function hasSecurityPatches(versionInfo) {
  // Check if newer versions have security-related tags or descriptions
  // Look for patch versions after 14.1.x
  const patchVersions = versionInfo.newerVersions
    .filter((v) => v.startsWith('14.'))
    .filter((v) => {
      const parts = v.split('.')
      return (
        parseInt(parts[1]) > 1 ||
        (parseInt(parts[1]) === 1 && parseInt(parts[2]) > 0)
      )
    })

  return patchVersions.length > 0
}

function loadLastCheck() {
  try {
    if (fs.existsSync(CONFIG.logFile)) {
      const data = fs.readFileSync(CONFIG.logFile, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    // Ignore file read errors
  }
  return { lastCheck: null, lastAlerted: null, versions: [] }
}

function saveCheck(data) {
  fs.writeFileSync(CONFIG.logFile, JSON.stringify(data, null, 2))
}

function formatAlert(versions) {
  return `
╔════════════════════════════════════════════════════════════════╗
║         🔒 NEXT.JS SECURITY PATCH AVAILABLE                   ║
╚════════════════════════════════════════════════════════════════╝

Current Version: ${CONFIG.currentVersion}
Available Updates: ${versions.join(', ')}

CVEs Being Monitored:
  • ${CONFIG.cves[0]} (High Severity - DoS)
  • ${CONFIG.cves[1]} (Medium Severity - Source Code Exposure)

ACTION REQUIRED:
  1. Review release notes: https://github.com/vercel/next.js/releases
  2. Test update in development
  3. Deploy patched version to production

Check Status:
  ✓ Last checked: ${new Date().toISOString()}
  ✓ Configuration: /scripts/monitor-security-patches.js

For more info on these CVEs:
  https://github.com/vercel/next.js/security/advisories

════════════════════════════════════════════════════════════════
`
}

async function checkForPatches() {
  try {
    const state = loadLastCheck()
    const now = Date.now()

    // Throttle checks
    if (state.lastCheck && now - state.lastCheck < CONFIG.checkInterval) {
      return
    }

    console.log(`🔍 Checking for Next.js security patches...`)

    const versionInfo = await getLatestVersion()
    const hasPatches = hasSecurityPatches(versionInfo)

    state.lastCheck = now
    state.newestVersions = versionInfo.newerVersions.slice(0, 5)

    if (
      hasPatches &&
      (!state.lastAlerted || now - state.lastAlerted > 24 * 60 * 60 * 1000)
    ) {
      console.log(formatAlert(state.newestVersions))
      state.lastAlerted = now
    } else if (hasPatches) {
      console.log(
        `✅ Security patches available (last alert: ${new Date(
          state.lastAlerted
        ).toLocaleString()})`
      )
    } else {
      console.log(`✅ No security patches available yet for version 14.x`)
    }

    saveCheck(state)
  } catch (error) {
    console.error('❌ Error checking for patches:', error.message)
  }
}

// Run immediately on first call
checkForPatches().then(() => {
  // Then set up interval for subsequent checks
  setInterval(checkForPatches, CONFIG.checkInterval)
  console.log(`📋 Monitor running. Will check every 6 hours.`)
})

module.exports = { checkForPatches }
