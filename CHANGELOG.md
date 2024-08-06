# Change history for stripes-authorization-components

## 1.0.0 (IN PROGRESS)

* [UISAUTHCOM-2](https://folio-org.atlassian.net/browse/UISAUTHCOM-2) Move component CapabilitiesSection from ui-authorization-roles.
* [UISAUTHCOM-5](https://folio-org.atlassian.net/browse/UISAUTHCOM-5) Add formatter to highlight unique values in CapabilitySection.
* [UISAUTHCOM-1](https://folio-org.atlassian.net/browse/UISAUTHCOM-1)Move reusable components from UIROLES to a shared repository.
* [UISAUTHCOM-6](https://folio-org.atlassian.net/browse/UISAUTHCOM-6) add `expand` parameter to queryKey in useRoleCapabilities hook.
* [UISAUTHCOM-7](https://folio-org.atlassian.net/browse/UISAUTHCOM-7) Fix definition and calls to useRoleCapabilities/useRoleCapabilitySets so correct value is used for X-Okapi-Tenant.
* [UISAUTHCOM-10](https://folio-org.atlassian.net/browse/UISAUTHCOM-10) clean up query cache on close edit role mode, provide `virtualize` property to capabilities/sets tables. 
* [UISAUTHCOM-9](https://folio-org.atlassian.net/browse/UISAUTHCOM-9) conditionally set values of selected capabilities/sets to true if checked and remove from object if NOT