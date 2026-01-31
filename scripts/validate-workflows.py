#!/usr/bin/env python3
"""
Workflow Validator Script

Validates GitHub Actions workflow files for syntax and best practices.
"""

import argparse
import sys
import yaml
from pathlib import Path
from typing import List, Tuple


class WorkflowValidator:
    """Validates GitHub Actions workflow YAML files."""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.errors = []
        self.warnings = []

    def log(self, message: str):
        """Print message if verbose mode is enabled."""
        if self.verbose:
            print(message)

    def validate_yaml_syntax(self, filepath: Path) -> bool:
        """
        Validate YAML syntax.

        Args:
            filepath: Path to the workflow file

        Returns:
            True if valid, False otherwise
        """
        try:
            with open(filepath, 'r') as f:
                yaml.safe_load(f)
            self.log(f"✓ {filepath}: Valid YAML syntax")
            return True
        except yaml.YAMLError as e:
            self.errors.append(f"✗ {filepath}: YAML syntax error: {e}")
            return False
        except Exception as e:
            self.errors.append(f"✗ {filepath}: Error reading file: {e}")
            return False

    def validate_workflow_structure(self, filepath: Path) -> bool:
        """
        Validate GitHub Actions workflow structure.

        Args:
            filepath: Path to the workflow file

        Returns:
            True if valid, False otherwise
        """
        try:
            with open(filepath, 'r') as f:
                workflow = yaml.safe_load(f)

            if not isinstance(workflow, dict):
                self.errors.append(
                    f"✗ {filepath}: Workflow must be a YAML mapping"
                )
                return False

            # Check required top-level fields
            if 'name' not in workflow:
                self.warnings.append(
                    f"⚠ {filepath}: Missing 'name' field (recommended)"
                )

            if 'on' not in workflow:
                self.errors.append(f"✗ {filepath}: Missing required 'on' field")
                return False

            if 'jobs' not in workflow:
                self.errors.append(
                    f"✗ {filepath}: Missing required 'jobs' field"
                )
                return False

            # Validate jobs structure
            if not isinstance(workflow['jobs'], dict):
                self.errors.append(
                    f"✗ {filepath}: 'jobs' must be a mapping"
                )
                return False

            if len(workflow['jobs']) == 0:
                self.errors.append(
                    f"✗ {filepath}: 'jobs' must contain at least one job"
                )
                return False

            # Validate each job
            for job_name, job in workflow['jobs'].items():
                if not isinstance(job, dict):
                    self.errors.append(
                        f"✗ {filepath}: Job '{job_name}' must be a mapping"
                    )
                    return False

                if 'runs-on' not in job:
                    self.errors.append(
                        f"✗ {filepath}: Job '{job_name}' missing "
                        f"required 'runs-on' field"
                    )
                    return False

                if 'steps' not in job:
                    self.errors.append(
                        f"✗ {filepath}: Job '{job_name}' missing "
                        f"required 'steps' field"
                    )
                    return False

                if not isinstance(job['steps'], list):
                    self.errors.append(
                        f"✗ {filepath}: Job '{job_name}' 'steps' "
                        f"must be a list"
                    )
                    return False

            self.log(f"✓ {filepath}: Valid workflow structure")
            return True

        except Exception as e:
            self.errors.append(
                f"✗ {filepath}: Error validating structure: {e}"
            )
            return False

    def validate_file(self, filepath: Path) -> bool:
        """
        Validate a single workflow file.

        Args:
            filepath: Path to the workflow file

        Returns:
            True if valid, False otherwise
        """
        self.log(f"\nValidating {filepath}...")

        # Check file exists
        if not filepath.exists():
            self.errors.append(f"✗ {filepath}: File does not exist")
            return False

        # Check file extension
        if filepath.suffix not in ['.yml', '.yaml']:
            self.warnings.append(
                f"⚠ {filepath}: File extension should be .yml or .yaml"
            )

        # Validate syntax
        if not self.validate_yaml_syntax(filepath):
            return False

        # Validate structure
        if not self.validate_workflow_structure(filepath):
            return False

        return True

    def validate_directory(self, dirpath: Path) -> bool:
        """
        Validate all workflow files in a directory.

        Args:
            dirpath: Path to the directory

        Returns:
            True if all files are valid, False otherwise
        """
        if not dirpath.is_dir():
            self.errors.append(f"✗ {dirpath}: Not a directory")
            return False

        workflow_files = list(dirpath.glob('*.yml')) + \
            list(dirpath.glob('*.yaml'))

        if not workflow_files:
            self.warnings.append(
                f"⚠ {dirpath}: No workflow files found"
            )
            return True

        all_valid = True
        for filepath in sorted(workflow_files):
            if not self.validate_file(filepath):
                all_valid = False

        return all_valid

    def print_summary(self):
        """Print validation summary."""
        print("\n" + "=" * 70)
        print("Validation Summary")
        print("=" * 70)

        if self.warnings:
            print(f"\n⚠ Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  {warning}")

        if self.errors:
            print(f"\n✗ Errors ({len(self.errors)}):")
            for error in self.errors:
                print(f"  {error}")
        else:
            print("\n✓ All validations passed!")

        print("=" * 70)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Validate GitHub Actions workflow files'
    )
    parser.add_argument(
        'paths',
        nargs='+',
        help='Workflow file(s) or directory to validate'
    )
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose output'
    )

    args = parser.parse_args()

    validator = WorkflowValidator(verbose=args.verbose)
    all_valid = True

    for path_str in args.paths:
        path = Path(path_str)

        if path.is_file():
            if not validator.validate_file(path):
                all_valid = False
        elif path.is_dir():
            if not validator.validate_directory(path):
                all_valid = False
        else:
            validator.errors.append(f"✗ {path}: Not found")
            all_valid = False

    validator.print_summary()

    sys.exit(0 if all_valid else 1)


if __name__ == '__main__':
    main()
