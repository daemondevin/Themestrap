# Vendor Directory

The `vendor` directory contains all third-party libraries, plugins, frameworks, and external dependencies used by Themestrap.

These files are maintained separately from the core Themestrap source to make updates, maintenance, and dependency management easier.

## Purpose

* Store third-party code and assets.
* Keep external dependencies isolated from the application code.
* Simplify upgrading individual libraries without affecting the rest of the project.
* Preserve the integrity of upstream packages.

## Guidelines

* Do **not** modify files in this directory unless absolutely necessary.
* If a library requires customization, prefer extending or overriding it elsewhere in the project rather than editing the original source.
* Replace or update libraries using their official releases whenever possible.

Keeping vendor code separate helps ensure cleaner project organization, easier maintenance, and smoother upgrades.
