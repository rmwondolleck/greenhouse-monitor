package main

import (
	"flag"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

// WorkflowValidator validates GitHub Actions workflow YAML files
type WorkflowValidator struct {
	verbose  bool
	errors   []string
	warnings []string
}

// NewValidator creates a new WorkflowValidator
func NewValidator(verbose bool) *WorkflowValidator {
	return &WorkflowValidator{
		verbose:  verbose,
		errors:   []string{},
		warnings: []string{},
	}
}

// Log prints message if verbose mode is enabled
func (v *WorkflowValidator) log(message string) {
	if v.verbose {
		fmt.Println(message)
	}
}

// ValidateYAMLSyntax validates YAML syntax
func (v *WorkflowValidator) ValidateYAMLSyntax(filePath string) bool {
	data, err := os.ReadFile(filePath)
	if err != nil {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: Error reading file: %v", filePath, err))
		return false
	}

	var content interface{}
	err = yaml.Unmarshal(data, &content)
	if err != nil {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: YAML syntax error: %v", filePath, err))
		return false
	}

	v.log(fmt.Sprintf("✓ %s: Valid YAML syntax", filePath))
	return true
}

// ValidateWorkflowStructure validates GitHub Actions workflow structure
func (v *WorkflowValidator) ValidateWorkflowStructure(filePath string) bool {
	data, err := os.ReadFile(filePath)
	if err != nil {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: Error reading file: %v", filePath, err))
		return false
	}

	var workflow map[string]interface{}
	err = yaml.Unmarshal(data, &workflow)
	if err != nil {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: Error parsing YAML: %v", filePath, err))
		return false
	}

	// Check if workflow is a map
	if workflow == nil {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: Workflow must be a YAML mapping", filePath))
		return false
	}

	// Check required top-level fields
	if _, ok := workflow["name"]; !ok {
		v.warnings = append(v.warnings, fmt.Sprintf("⚠ %s: Missing 'name' field (recommended)", filePath))
	}

	if _, ok := workflow["on"]; !ok {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: Missing required 'on' field", filePath))
		return false
	}

	jobsInterface, ok := workflow["jobs"]
	if !ok {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: Missing required 'jobs' field", filePath))
		return false
	}

	// Validate jobs structure
	jobs, ok := jobsInterface.(map[string]interface{})
	if !ok {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: 'jobs' must be a mapping", filePath))
		return false
	}

	if len(jobs) == 0 {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: 'jobs' must contain at least one job", filePath))
		return false
	}

	// Validate each job
	for jobName, jobInterface := range jobs {
		job, ok := jobInterface.(map[string]interface{})
		if !ok {
			v.errors = append(v.errors, fmt.Sprintf("✗ %s: Job '%s' must be a mapping", filePath, jobName))
			return false
		}

		if _, ok := job["runs-on"]; !ok {
			v.errors = append(v.errors, fmt.Sprintf("✗ %s: Job '%s' missing required 'runs-on' field", filePath, jobName))
			return false
		}

		if _, ok := job["steps"]; !ok {
			v.errors = append(v.errors, fmt.Sprintf("✗ %s: Job '%s' missing required 'steps' field", filePath, jobName))
			return false
		}

		// Check that steps is a list
		steps, ok := job["steps"].([]interface{})
		if !ok {
			v.errors = append(v.errors, fmt.Sprintf("✗ %s: Job '%s' 'steps' must be a list", filePath, jobName))
			return false
		}

		if len(steps) == 0 {
			v.warnings = append(v.warnings, fmt.Sprintf("⚠ %s: Job '%s' has no steps", filePath, jobName))
		}
	}

	v.log(fmt.Sprintf("✓ %s: Valid workflow structure", filePath))
	return true
}

// ValidateFile validates a single workflow file
func (v *WorkflowValidator) ValidateFile(filePath string) bool {
	v.log(fmt.Sprintf("\nValidating %s...", filePath))

	// Check file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: File does not exist", filePath))
		return false
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(filePath))
	if ext != ".yml" && ext != ".yaml" {
		v.warnings = append(v.warnings, fmt.Sprintf("⚠ %s: File extension should be .yml or .yaml", filePath))
	}

	// Validate syntax
	if !v.ValidateYAMLSyntax(filePath) {
		return false
	}

	// Validate structure
	if !v.ValidateWorkflowStructure(filePath) {
		return false
	}

	return true
}

// ValidateDirectory validates all workflow files in a directory
func (v *WorkflowValidator) ValidateDirectory(dirpath string) bool {
	info, err := os.Stat(dirpath)
	if err != nil {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: %v", dirpath, err))
		return false
	}

	if !info.IsDir() {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: Not a directory", dirpath))
		return false
	}

	var workflowFiles []string
	err = filepath.WalkDir(dirpath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			ext := strings.ToLower(filepath.Ext(path))
			if ext == ".yml" || ext == ".yaml" {
				workflowFiles = append(workflowFiles, path)
			}
		}
		return nil
	})

	if err != nil {
		v.errors = append(v.errors, fmt.Sprintf("✗ %s: Error reading directory: %v", dirpath, err))
		return false
	}

	if len(workflowFiles) == 0 {
		v.warnings = append(v.warnings, fmt.Sprintf("⚠ %s: No workflow files found", dirpath))
		return true
	}

	allValid := true
	for _, file := range workflowFiles {
		if !v.ValidateFile(file) {
			allValid = false
		}
	}

	return allValid
}

// PrintSummary prints validation summary
func (v *WorkflowValidator) PrintSummary() {
	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println("Validation Summary")
	fmt.Println(strings.Repeat("=", 70))

	if len(v.warnings) > 0 {
		fmt.Printf("\n⚠ Warnings (%d):\n", len(v.warnings))
		for _, warning := range v.warnings {
			fmt.Printf("  %s\n", warning)
		}
	}

	if len(v.errors) > 0 {
		fmt.Printf("\n✗ Errors (%d):\n", len(v.errors))
		for _, err := range v.errors {
			fmt.Printf("  %s\n", err)
		}
	} else {
		fmt.Println("\n✓ All validations passed!")
	}

	fmt.Println(strings.Repeat("=", 70))
}

// HasErrors returns true if there are errors
func (v *WorkflowValidator) HasErrors() bool {
	return len(v.errors) > 0
}

func main() {
	verbose := flag.Bool("verbose", false, "Enable verbose output")
	flag.BoolVar(verbose, "v", false, "Enable verbose output (shorthand)")
	flag.Parse()

	if flag.NArg() == 0 {
		fmt.Println("Usage: validate-workflows [options] <path...>")
		fmt.Println("\nValidates GitHub Actions workflow files")
		fmt.Println("\nOptions:")
		flag.PrintDefaults()
		fmt.Println("\nArguments:")
		fmt.Println("  path    Workflow file(s) or directory to validate")
		os.Exit(1)
	}

	validator := NewValidator(*verbose)
	allValid := true

	for _, path := range flag.Args() {
		info, err := os.Stat(path)
		if err != nil {
			validator.errors = append(validator.errors, fmt.Sprintf("✗ %s: Not found", path))
			allValid = false
			continue
		}

		if info.IsDir() {
			if !validator.ValidateDirectory(path) {
				allValid = false
			}
		} else {
			if !validator.ValidateFile(path) {
				allValid = false
			}
		}
	}

	validator.PrintSummary()

	if !allValid || validator.HasErrors() {
		os.Exit(1)
	}
}
