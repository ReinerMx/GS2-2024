const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");
const Item = require('./Item');

/**
 * Represents a Machine Learning Model (MlmModel) in the database, with metadata describing its structure, tasks, framework, 
 * and input/output transformations. This model is linked to a specific collection and includes details about pretraining, 
 * memory requirements, and hyperparameters.
 * 
 * @typedef {Object} MlmModel
 * @property {number} id - Primary key for the model. Auto-incremented integer ID.
 * @property {string} mlm_name - REQUIRED. The name of the machine learning model. This should be a meaningful and unique identifier.
 * @property {string} mlm_architecture - REQUIRED. The architecture of the model (e.g., ResNet, VGG, GAN). Must be a predefined type or "custom"/"unknown".
 * @property {string[]} mlm_tasks - REQUIRED. A list of machine learning tasks the model is designed for (e.g., regression, classification, segmentation).
 * @property {string|null} [mlm_framework] - The machine learning framework used to train the model (e.g., PyTorch, TensorFlow).
 * @property {string|null} [mlm_framework_version] - The version of the framework used. Optional but recommended for compatibility tracking.
 * @property {number|null} [mlm_memory_size] - The memory required by the model during inference on an accelerator, measured in bytes. Must be a positive integer.
 * @property {number|null} [mlm_total_parameters] - The total number of parameters in the model, both trainable and non-trainable.
 * @property {boolean|null} [mlm_pretrained] - Indicates whether the model is pretrained. If true, the pretraining source is expected.
 * @property {string|null} [mlm_pretrained_source] - The source dataset or description of pretraining (e.g., ImageNet, dataset URL). Required if `mlm_pretrained` is true.
 * @property {number|null} [mlm_batch_size_suggestion] - Suggested batch size for inference. Must be a positive integer.
 * @property {string|null} [mlm_accelerator] - Specifies the intended hardware accelerator (e.g., cuda, amd64, intel-ipex-cpu). Optional.
 * @property {boolean} [mlm_accelerator_constrained=false] - Indicates whether the model can only run on the specified accelerator.
 * @property {string|null} [mlm_accelerator_summary] - A high-level description of the required accelerator, such as generation or specific features.
 * @property {number|null} [mlm_accelerator_count] - The minimum number of accelerator instances required for inference.
 * @property {Object} mlm_input - REQUIRED. Describes the transformation between Earth Observation (EO) data and the model's input, including structure, scaling, and preprocessing details.
 * @property {Object} mlm_output - REQUIRED. Defines the model's output structure, interpretation, tasks, and any required post-processing.
 * @property {Object|null} [hyperparameters] - A JSON object containing additional hyperparameters relevant to the model's training or inference.
 * @property {string|null} [collection_id] - References the `collection_id` from the `Collection` model, linking this model to a specific collection.
 * 
 * @see https://github.com/stac-extensions/mlm?tab=readme-ov-file#data-type-enum
 */
const MlmModel = sequelize.define('MlmModel', {
  /**
   * Primary key for the model.
   * Auto-incremented integer ID.
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  /**
   * Name of the machine learning model.
   * Required and must be non-empty.
   */
  /**
   * REQUIRED A name for the model. 
   * This can include, but must be distinct, from simply naming the model architecture. 
   * If there is a publication or other published work related to the model, 
   * use the official name of the model.
   */
  mlm_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * Machine learning architecture (e.g., ResNet, VGG).
   * Limited to a predefined set of architectures.
   */
  /**
   * REQUIRED A generic and well established architecture name of the model.
   */
  mlm_architecture: {
  type: DataTypes.STRING,
  allowNull: false, 
  },
  /**
   * REQUIRED Specifies the Machine Learning tasks for which the model can be used for. 
   * If multi-tasks outputs are provided by distinct model heads, specify all available 
   * tasks under the main properties and specify respective tasks in each Model Output Object.
   */
  mlm_tasks: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    validate: {
      isValidTaskList(value) {
          const validTasks = [
              'regression',
              'classification',
              'scene-classification',
              'detection',
              'object-detection',
              'segmentation',
              'semantic-segmentation',
              'instance-segmentation',
              'panoptic-segmentation',
              'similarity-search',
              'generative',
              'image-captioning',
              'super-resolution',
          ];

          if (!Array.isArray(value)) {
              throw new Error("'mlm:tasks' must be an array of strings.");
          }

          value.forEach(task => {
              if (!validTasks.includes(task)) {
                  throw new Error(
                      `Invalid task: '${task}'. Use one of the predefined task names or refer to Papers With Code for normalization.`
                  );
              }
          });
      },
    },
  },
  /**
   * Framework used to train the model (ex: PyTorch, TensorFlow).
   */
  mlm_framework: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isCommonFramework(value) {
          const commonFrameworks = [
              'PyTorch',
              'pytorch',
              'TensorFlow',
              'scikit-learn',
              'Hugging Face',
              'Keras',
              'ONNX',
              'rgee',
              'spatialRF',
              'JAX',
              'MXNet',
              'Caffe',
              'PyMC',
              'Weka',
          ];

          // Warning if a not commonly recognized framework is used
          if (!commonFrameworks.includes(value)) {
              console.warn(
                  `Framework '${value}' is not a commonly recognized ML framework. Make sure the name is correct.`
              );
          }
      },
  },
  },
  /**
   * The framework library version. 
   * Some models require a specific version of the machine learning framework to run.
   */
  mlm_framework_version: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  /**
   * The in-memory size of the model on the accelerator during inference (bytes).
   */
  mlm_memory_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isPositive(value) {
          if (value <= 0) {
              throw new Error("'mlm:memory_size' must be a positive integer representing bytes.");
          }
      },
  },
  },
  /**
   * Total number of model parameters, including trainable and non-trainable parameters.
   */
  mlm_total_parameters: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  /**
   * Indicates if the model was pretrained. 
   * If the model was pretrained, consider providing pretrained_source if it is known.
   */
  mlm_pretrained: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  /**
   * The source of the pretraining. 
   * Can refer to popular pretraining datasets by name (i.e. Imagenet) 
   * or less known datasets by URL and description. 
   * If trained from scratch (i.e.: pretrained = false), the null value should be set explicitly.
   */
  mlm_pretrained_source: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isValidPretrainedSource(value) {
          if (value === null) {
              return true; // null is okay if the model is not pretrained
          }

          if (typeof value !== 'string' || value.trim() === '') {
              throw new Error(
                  "'mlm:pretrained_source' must be a non-empty string or null."
              );
          }
      },
  },
  },
  /**
   * A suggested batch size for the accelerator and summarized hardware.
   */
  mlm_batch_size_suggestion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isPositiveInteger(value) {
          if (!Number.isInteger(value) || value <= 0) {
              throw new Error(
                  "'mlm:batch_size_suggestion' must be a positive integer greater than zero."
              );
          }
      },
  },
  },
  /**
   * The intended computational hardware that runs inference. 
   * If undefined or set to null explicitly, the model does not require any specific accelerator.
   */
  mlm_accelerator: {
    type: DataTypes.STRING, // Enum or null
    allowNull: true, // null means no specific Hardware needed
    validate: {
        isValidAccelerator(value) {
            const validAccelerators = [
                'amd64',
                'cuda',
                'xla',
                'amd-rocm',
                'intel-ipex-cpu',
                'intel-ipex-gpu',
                'macos-arm',
            ];

            // Warning if no valid accelerator is used
            if (value !== null && !validAccelerators.includes(value)) {
                console.warn(
                    `'mlm:accelerator' should be one of the following: ${validAccelerators.join(', ')}, or null.`
                );
            }
        },
    },
  },
  /**
   * Indicates if the intended accelerator is the only accelerator that can run inference. 
   * If undefined, it should be assumed false.
   */
  mlm_accelerator_constrained: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  /**
   * A high level description of the accelerator, such as its specific generation, 
   * or other relevant inference details.
   */
  mlm_accelerator_summary: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNonEmptyString(value) {
          if (value !== null && (typeof value !== 'string' || value.trim() === '')) {
              throw new Error(
                  `'mlm:accelerator_summary' must be a non-empty string or null.`
              );
          }
      },
  },
  },
  /**
   * A minimum amount of accelerator instances required to run the model
   */
  mlm_accelerator_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  /**
   * REQUIRED Describes the transformation between the EO data and the model input.
   */
  mlm_input: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidInput(value) {
        // Ensure the input is always an array
        if (!Array.isArray(value)) {
            throw new Error("'mlm_input' must be an array.");
        }
    
        // Check that the array is not empty
        if (value.length === 0) {
            throw new Error("'mlm_input' array must contain at least one entry.");
        }
    
        // Iterate through each object in the array
        value.forEach((inputObj, index) => {
            // Validate 'name'
            if (!inputObj.name || typeof inputObj.name !== 'string' || inputObj.name.trim() === '') {
                throw new Error(`'mlm_input[${index}].name' is required and must be a non-empty string.`);
            }
    
            // Validate 'bands'
            if (!inputObj.bands || !Array.isArray(inputObj.bands)) {
                throw new Error(`'mlm_input[${index}].bands' is required and must be an array.`);
            }
            inputObj.bands.forEach((band, bandIndex) => {
                if (typeof band === 'object') {
                    if (!band.name || typeof band.name !== 'string') {
                        throw new Error(`'mlm_input[${index}].bands[${bandIndex}].name' must be a non-empty string.`);
                    }
                    if (band.format && typeof band.format !== 'string') {
                        throw new Error(`'mlm_input[${index}].bands[${bandIndex}].format', if provided, must be a string.`);
                    }
                    if (band.expression && typeof band.expression !== 'string') {
                        throw new Error(`'mlm_input[${index}].bands[${bandIndex}].expression', if provided, must be a string.`);
                    }
                } else if (typeof band !== 'string') {
                    throw new Error(`'mlm_input[${index}].bands[${bandIndex}]' must be a string or a valid band object.`);
                }
            });
    
            // Validate 'input'
            if (!inputObj.input || typeof inputObj.input !== 'object') {
                throw new Error(`'mlm_input[${index}].input' is required and must be a valid object.`);
            }
            if (!Array.isArray(inputObj.input.shape) || inputObj.input.shape.some(dim => dim <= 0 && dim !== -1)) {
                throw new Error(`'mlm_input[${index}].input.shape' must be an array of positive integers or -1.`);
            }
            if (!Array.isArray(inputObj.input.dim_order) || inputObj.input.dim_order.length !== inputObj.input.shape.length) {
                throw new Error(`'mlm_input[${index}].input.dim_order' must match the length of 'mlm_input[${index}].input.shape'.`);
            }
            const validDimensions = ['batch', 'channel', 'time', 'height', 'width', 'depth', 'token', 'class', 'score', 'confidence'];
            inputObj.input.dim_order.forEach((dim, dimIndex) => {
                if (!validDimensions.includes(dim)) {
                    throw new Error(`Invalid dimension '${dim}' in 'mlm_input[${index}].input.dim_order[${dimIndex}]'.`);
                }
            });
            if (!inputObj.input.data_type || typeof inputObj.input.data_type !== 'string') {
                throw new Error(`'mlm_input[${index}].input.data_type' is required and must be a string.`);
            }
    
            // Validate optional 'value_scaling'
            if (inputObj.value_scaling !== null && inputObj.value_scaling !== undefined) {
              if (!Array.isArray(inputObj.value_scaling)) {
                  throw new Error(`'mlm_input[${index}].value_scaling' must be an array or null.`);
              }
              inputObj.value_scaling.forEach((scale, scaleIndex) => {
                  if (!scale.type || typeof scale.type !== 'string') {
                      throw new Error(`'mlm_input[${index}].value_scaling[${scaleIndex}].type' must be a non-empty string.`);
                  }
                  const validScalingTypes = ['min-max', 'z-score', 'clip', 'clip-min', 'clip-max', 'offset', 'scale', 'processing'];
                  if (!validScalingTypes.includes(scale.type)) {
                      throw new Error(`Invalid 'type' in 'mlm_input[${index}].value_scaling[${scaleIndex}]: ${scale.type}. Must be one of: ${validScalingTypes.join(', ')}`);
                  }
                  if (scale.params && typeof scale.params !== 'object') {
                      throw new Error(`'mlm_input[${index}].value_scaling[${scaleIndex}].params', if provided, must be a valid JSON object.`);
                  }
              });
          }          
    
            // Validate optional 'resize_type'
            const validResizeTypes = [
              'crop', 'pad', 'interpolation-nearest', 'interpolation-linear',
              'interpolation-cubic', 'interpolation-area', 'interpolation-lanczos4',
              'interpolation-max', 'wrap-fill-outliers', 'wrap-inverse-map'
            ];
            if (inputObj.resize_type !== null && inputObj.resize_type !== undefined && !validResizeTypes.includes(inputObj.resize_type)) {
              throw new Error(`'mlm_input[${index}].resize_type' must be one of ${validResizeTypes.join(', ')} or null.`);
            }

            // Validate optional 'pre_processing_function'
            if (inputObj.pre_processing_function !== null && inputObj.pre_processing_function !== undefined) {
              if (typeof inputObj.pre_processing_function !== 'object' ||
                  !inputObj.pre_processing_function.format ||
                  !inputObj.pre_processing_function.expression) {
                  throw new Error(`'mlm_input[${index}].pre_processing_function' must include 'format' and 'expression'.`);
              }
            }
          });
        },
      },
    },

  /**
   * REQUIRED Describes each model output and how to interpret it.
   */
  mlm_output: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
        isValidOutput(value) {
            // Ensure the output is always an array
            if (!Array.isArray(value)) {
                throw new Error("'mlm_output' must be an array.");
            }

            // Check that the array is not empty
            if (value.length === 0) {
                throw new Error("'mlm_output' array must contain at least one entry.");
            }

            // Iterate through each object in the array
            value.forEach((outputObj, index) => {
                // Validate 'name'
                if (!outputObj.name || typeof outputObj.name !== 'string' || outputObj.name.trim() === '') {
                    throw new Error(`'mlm_output[${index}].name' is required and must be a non-empty string.`);
                }

                // Validate 'tasks'
                if (!outputObj.tasks || !Array.isArray(outputObj.tasks)) {
                    throw new Error(`'mlm_output[${index}].tasks' must be an array.`);
                }
                const validTasks = [
                    'regression', 'classification', 'scene-classification', 'detection',
                    'object-detection', 'segmentation', 'semantic-segmentation', 'instance-segmentation',
                    'panoptic-segmentation', 'similarity-search', 'generative', 'image-captioning',
                    'super-resolution',
                ];
                outputObj.tasks.forEach((task, taskIndex) => {
                    if (!validTasks.includes(task)) {
                        throw new Error(`Invalid task '${task}' in 'mlm_output[${index}].tasks[${taskIndex}]'. Use one of the predefined tasks.`);
                    }
                });

                // Validate 'result'
                if (!outputObj.result || typeof outputObj.result !== 'object') {
                    throw new Error(`'mlm_output[${index}].result' must be a valid object.`);
                }
                if (!Array.isArray(outputObj.result.shape) || outputObj.result.shape.length === 0) {
                    throw new Error(`'mlm_output[${index}].result.shape' must be a non-empty array.`);
                }
               /* if (!Array.isArray(outputObj.result.dim_order) || outputObj.result.dim_order.length !== outputObj.result.shape.length) {
                    throw new Error(`'mlm_output[${index}].result.dim_order' must match the length of 'mlm_output[${index}].result.shape'.`);
                }*/
                const validDimensions = ['batch', 'channel', 'time', 'height', 'width', 'depth', 'token', 'class', 'score', 'confidence'];
                outputObj.result.dim_order.forEach((dim, dimIndex) => {
                    if (!validDimensions.includes(dim)) {
                        throw new Error(`Invalid dimension '${dim}' in 'mlm_output[${index}].result.dim_order[${dimIndex}]'.`);
                    }
                });
                if (!outputObj.result.data_type || typeof outputObj.result.data_type !== 'string') {
                    throw new Error(`'mlm_output[${index}].result.data_type' is required and must be a string.`);
                }

                // Validate optional 'classification:classes'
                if (outputObj['classification:classes'] !== null && !Array.isArray(outputObj['classification:classes'])) {
                    throw new Error(`'mlm_output[${index}]["classification:classes"]' must be an array or null.`);
                }
                if (Array.isArray(outputObj['classification:classes'])) {
                    outputObj['classification:classes'].forEach((classObj, classIndex) => {
                        if (typeof classObj.value !== 'number' || !classObj.name || typeof classObj.name !== 'string') {
                            throw new Error(`Each class object in 'mlm_output[${index}]["classification:classes"][${classIndex}]' must have a 'value' (number) and a 'name' (string).`);
                        }
                        if (classObj.description && typeof classObj.description !== 'string') {
                            throw new Error(`'mlm_output[${index}]["classification:classes"][${classIndex}].description', if provided, must be a string.`);
                        }
                    });
                }

                // Validate optional 'post_processing_function'
                if (outputObj.post_processing_function !== null) {
                    if (typeof outputObj.post_processing_function !== 'object' ||
                        !outputObj.post_processing_function.format ||
                        !outputObj.post_processing_function.expression) {
                        throw new Error(`'mlm_output[${index}].post_processing_function' must include 'format' and 'expression' fields.`);
                    }
                }
              });
            },
          }
        },

        item_id: {
          type: DataTypes.STRING,
          references: {
            model: 'item',
            key: 'item_id',
          },
          onDelete: 'CASCADE',
        }
        },{
          tableName: 'mlm_model',
          timestamps: false,
      });
      

module.exports = MlmModel;
