import { FieldError, ValidationFunction, ValidationRecord, VerifierRecord } from './types';

export async function validate<T>(fields: T, validator: ValidationFunction<T>): Promise<FieldError[]> {
  const fieldErrors: FieldError[] = [];
  const parsers: VerifierRecord<T> = {};
  const validators: ValidationRecord<T> = {};

  // Calls the validator callback to define all verifiers
  validator({
    parse: (key, predicate, failMessage) => {
      const parser = parsers[key];
      if (!parser) {
        parsers[key] = [{ predicate, failMessage }];
      } else {
        parser.push({ predicate, failMessage });
      }
    },

    validate: (key, predicate) => {
      const validator = validators[key];
      if (!validator) {
        validators[key] = [predicate];
      } else {
        validator.push(predicate);
      }
    }
  });

  // Go through all the first verifiers and verify them
  for (const i in parsers) {
    //@ts-expect-error ignore
    for (const { predicate, failMessage } of parsers[i]) {
      const success = await predicate(fields[i]);
      if (!success) {
        fieldErrors.push({ field: i, message: failMessage });
      }
    }
  }

  // Loop through all sub-validators and execute them via recursion
  for (const i in validators) {
    //@ts-expect-error ignore
    for (const validator of validators[i]) {
      const errors = await validate(fields[i], ({ parse, validate }) => {
        validator({ parse, validate });
      });

      const mappedFieldNames = errors.map((val) => {
        val.field = i + '.' + val.field;
        return val;
      });

      fieldErrors.push(...mappedFieldNames);
    }
  }

  return fieldErrors;
}
