// eslint-disable-next-line no-global-assign
Promise = require(`bluebird`);

const _ = require(`lodash`);
const path = require(`path`);

/***********************************
 * Initialize API Builder
 ***********************************/
const ApiBuilder = require(`@axway/api-builder-runtime`);
const { app } = ApiBuilder.getGlobal();

/***********************************
 * Initialize Logging
 ***********************************/
const filename = __filename.substring(path.join(__dirname, `..`).length);
const logger = new app.locals.Logger({ filename });
logger.trace(`module initialization: ${filename}`);


/***********************************
 * Initialize Managers
 ***********************************/
const ApiManager = require(`../../lib/ApiManager`);
const ErrorManager = require(`../../lib/ErrorManager`);
const OperationManager = require(`../../lib/OperationManager`);

/***********************************
 * Initialize Instances
 ***********************************/
const api = new ApiManager();

/***********************************
 * Configure API
 ***********************************/

const operationMetadata = {
	group:       `submissions`,
	name:        `put-submission`,
	path:        `/api/v1/submissions/:submission_id`,
	method:      `PUT`,
	description: `Upserts a submission based on the ID supplied.  Will replace submission, if it already exists otherwise it will insert a new submission.`,
	parameters:  {
		submission_id:     { description: `ID of the submission to update`, type: `query`, optional: false  },
		id:                { description: `Unique ID for this entity (across environments)`, type: `body`, optional: true  },
		employee_id:       { description: `Entity ID of the user this capacity is for`, type: `body`, optional: true  },
		office_id:         { description: `Entity ID of the office this submission is for`, type: `body`, optional: true  },
		notice_id:         { description: `Entity ID of the notice this submission is for`, type: `body`, optional: false  },
		device_id:         { description: `Device ID for user`, type: `body`, optional: true  },
		sheet_id:          { description: `ID of the Google Sheet`, type: `body`, optional: true  },
		sheet_name:        { description: `Name of the Google Sheet`, type: `body`, optional: true  },
		notice_title:      { description: `Title of the notice that this submission is in response to`, type: `body`, optional: false  },
		notice_content:    { description: `Abbreviated form of content for the notice that this submission is in response to`, type: `body`, optional: true  },
		notice_version:    { description: `Version of the notice that this submission is in response to`, type: `body`, optional: true  },
		notice_type:       { description: `Type of notice`, type: `body`, optional: true  },
		notice_language:   { description: `Limit notice to particular language`, type: `body`, optional: true  },
		entries:           { description: `Submitted entries for the associated notice`, type: `body`, optional: false  },
		country:           { description: `Country of office`, type: `body`, optional: true  },
		locale:            { description: `Locale of user`, type: `body`, optional: true  },
		object_created_at: { description: `Autogenerated timestamp when DB field created`, type: `body`, optional: true  },
		object_updated_at: { description: `Autogenerated timestamp when DB field updated`, type: `body`, optional: true  },
		entity_created_at: { description: `entity_created_at`, type: `body`, optional: true  },
		entity_updated_at: { description: `entity_updated_at`, type: `body`, optional: true  },
		object_id:         { description: `Autogenerated Object ID for this entity`, type: `body`, optional: true  },
	},
	scopes:             [ `write:submissions` ],
	modelName:          `Submission`,
	actionName:         `upsert-one`,
	wildcardParameters: true,
};

module.exports = ApiBuilder.API.extend(
	Object.assign(operationMetadata, {
		async action (req, resp, next) {
			console.error(`******************************************************************************`);
			logger.entering(`operation: ${operationMetadata.name}`);

			try {

				const operationManager = new OperationManager({
					operationId: operationMetadata.operationId,
					metadata:    operationMetadata,
					logger,
					request:     req,
					response:    resp,
					next,
					api,
				});

				await operationManager.validateRequest();

				const { submission_id, employee_id, office_id, notice_id, device_id, sheet_id, sheet_name, notice_title, notice_content, notice_version, notice_type, notice_language, entries, country, locale  } = req.params;

				const result = await api.submissions.upsertByEntityId({
					employee_id,
					office_id,
					notice_id,
					device_id,
					sheet_id,
					sheet_name,
					notice_title,
					notice_content,
					notice_version,
					notice_type,
					notice_language,
					entries,
					country,
					locale,
				},
				submission_id,
				);

				// console.debug(`🦠  put-submission result: ${JSON.stringify(result, null, 2)}`);

				const response = {
					success: true,
					meta:    result.meta,
					results: result.results,
				};

				await operationManager.validateResponse(response);

				logger.debug({ message: `success response`, body: response });
				resp.response.status(200);
				return resp.send(response, null, next);

			} catch (error) {
				logger.entering(`catch`);
				const errorResponse = ErrorManager.createErrorResponse(error, logger);
				logger.error({ message: `error response`, body: errorResponse });
				resp.response.status(errorResponse.meta.code);
				return resp.send(errorResponse, null, next);
			}
		},
	}));