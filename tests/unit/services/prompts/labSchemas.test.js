/**
 * Tests for specialized lab schemas (Phase 3)
 */

import { describe, it, expect } from 'vitest'
import {
  xrayAnalysisSchema,
  bloodWorkAnalysisSchema,
  urinalysisAnalysisSchema,
} from '../../../../src/services/prompts/labSchemas'

describe('labSchemas', () => {
  // =========================================================================
  // X-ray Schema
  // =========================================================================

  describe('xrayAnalysisSchema', () => {
    it('is a valid JSON schema object', () => {
      expect(xrayAnalysisSchema.type).toBe('object')
      expect(xrayAnalysisSchema.properties).toBeDefined()
    })

    it('has required fields', () => {
      expect(xrayAnalysisSchema.required).toContain('is_xray')
      expect(xrayAnalysisSchema.required).toContain('overall_impression')
      expect(xrayAnalysisSchema.required).toContain('findings')
    })

    it('has is_xray boolean field', () => {
      expect(xrayAnalysisSchema.properties.is_xray).toBeDefined()
      expect(xrayAnalysisSchema.properties.is_xray.type).toBe('boolean')
    })

    it('has overall_impression enum field', () => {
      const field = xrayAnalysisSchema.properties.overall_impression
      expect(field.type).toBe('string')
      expect(field.enum).toContain('normal')
      expect(field.enum).toContain('abnormal_non_urgent')
      expect(field.enum).toContain('abnormal_urgent')
      expect(field.enum).toContain('critical')
    })

    it('has findings array with structure/observation/significance', () => {
      const findings = xrayAnalysisSchema.properties.findings
      expect(findings.type).toBe('array')

      const itemProps = findings.items.properties
      expect(itemProps.structure).toBeDefined()
      expect(itemProps.observation).toBeDefined()
      expect(itemProps.significance).toBeDefined()
      expect(itemProps.significance.enum).toContain('normal')
      expect(itemProps.significance.enum).toContain('abnormal')
    })

    it('has bone/soft tissue/joint assessment fields', () => {
      const props = xrayAnalysisSchema.properties
      expect(props.bone_assessment || props.skeletal_assessment).toBeDefined()
      expect(props.soft_tissue_assessment).toBeDefined()
      expect(props.joint_assessment).toBeDefined()
    })

    it('has foreign body detection field', () => {
      expect(xrayAnalysisSchema.properties.foreign_body_detected).toBeDefined()
    })

    it('has view type field', () => {
      const viewType = xrayAnalysisSchema.properties.view_type
      expect(viewType).toBeDefined()
      expect(viewType.enum).toContain('lateral')
      expect(viewType.enum).toContain('VD')
    })

    it('has differential diagnoses field', () => {
      expect(xrayAnalysisSchema.properties.differential_diagnoses).toBeDefined()
    })

    it('has descriptions on key properties', () => {
      const props = xrayAnalysisSchema.properties
      expect(props.overall_impression.description).toBeDefined()
      expect(props.findings.description).toBeDefined()
    })
  })

  // =========================================================================
  // Blood Work Schema
  // =========================================================================

  describe('bloodWorkAnalysisSchema', () => {
    it('is a valid JSON schema object', () => {
      expect(bloodWorkAnalysisSchema.type).toBe('object')
      expect(bloodWorkAnalysisSchema.properties).toBeDefined()
    })

    it('has required fields', () => {
      expect(bloodWorkAnalysisSchema.required).toContain('is_blood_work')
      expect(bloodWorkAnalysisSchema.required).toContain('overall_assessment')
      expect(bloodWorkAnalysisSchema.required).toContain('values')
    })

    it('has is_blood_work boolean field', () => {
      expect(bloodWorkAnalysisSchema.properties.is_blood_work).toBeDefined()
      expect(bloodWorkAnalysisSchema.properties.is_blood_work.type).toBe('boolean')
    })

    it('has values array with category grouping', () => {
      const values = bloodWorkAnalysisSchema.properties.values
      expect(values.type).toBe('array')

      const itemProps = values.items.properties
      expect(itemProps.name).toBeDefined()
      expect(itemProps.value).toBeDefined()
      expect(itemProps.status).toBeDefined()
      expect(itemProps.category).toBeDefined()

      // Status should be an enum
      expect(itemProps.status.enum).toContain('normal')
      expect(itemProps.status.enum).toContain('high')
      expect(itemProps.status.enum).toContain('low')
      expect(itemProps.status.enum).toContain('critical')
    })

    it('has organ_system_summary field', () => {
      expect(bloodWorkAnalysisSchema.properties.organ_system_summary).toBeDefined()
    })

    it('has medication_interactions field', () => {
      expect(bloodWorkAnalysisSchema.properties.medication_interactions).toBeDefined()
    })

    it('has abnormal_count field', () => {
      const field = bloodWorkAnalysisSchema.properties.abnormal_count
      expect(field).toBeDefined()
      expect(field.type).toBe('integer')
    })

    it('has descriptions on key properties', () => {
      const props = bloodWorkAnalysisSchema.properties
      expect(props.values.description).toBeDefined()
      expect(props.overall_assessment.description).toBeDefined()
    })
  })

  // =========================================================================
  // Urinalysis Schema
  // =========================================================================

  describe('urinalysisAnalysisSchema', () => {
    it('is a valid JSON schema object', () => {
      expect(urinalysisAnalysisSchema.type).toBe('object')
      expect(urinalysisAnalysisSchema.properties).toBeDefined()
    })

    it('has required fields', () => {
      expect(urinalysisAnalysisSchema.required).toContain('is_urinalysis')
      expect(urinalysisAnalysisSchema.required).toContain('overall_assessment')
    })

    it('has is_urinalysis boolean field', () => {
      expect(urinalysisAnalysisSchema.properties.is_urinalysis).toBeDefined()
      expect(urinalysisAnalysisSchema.properties.is_urinalysis.type).toBe('boolean')
    })

    it('has physical_properties field', () => {
      const field = urinalysisAnalysisSchema.properties.physical_properties
      expect(field).toBeDefined()
    })

    it('has chemical_analysis array', () => {
      const field = urinalysisAnalysisSchema.properties.chemical_analysis
      expect(field).toBeDefined()
      expect(field.type).toBe('array')
    })

    it('has sediment_findings field', () => {
      expect(urinalysisAnalysisSchema.properties.sediment_findings).toBeDefined()
    })

    it('has hydration_assessment field', () => {
      expect(urinalysisAnalysisSchema.properties.hydration_assessment).toBeDefined()
    })

    it('has descriptions on key properties', () => {
      const props = urinalysisAnalysisSchema.properties
      expect(props.is_urinalysis.description).toBeDefined()
    })
  })
})
