/**
 * 代码自动评分与反馈系统
 * 对用户的代码执行结果进行多维度评分并生成详细反馈意见
 */

/**
 * 对代码进行多维度评分
 * @param {string} userCode - 用户提交的代码
 * @param {string} output - 代码执行输出
 * @param {string} referenceCode - 参考答案代码
 * @param {object} project - 项目配置信息
 * @returns {object} 评分结果和反馈
 */
export function gradeCode(userCode, output, referenceCode, project) {
  const result = {
    score: 0,
    maxScore: 100,
    dimensions: {},
    feedback: [],
    suggestions: [],
    summary: '',
    projectRelevance: null
  }

  // 维度1: 代码功能性 (25分)
  const functionality = gradeFunctionality(userCode, output, project)
  result.dimensions.functionality = functionality
  result.score += functionality.score

  // 维度2: 语法正确性 (20分)
  const syntax = gradeSyntax(userCode, output)
  result.dimensions.syntax = syntax
  result.score += syntax.score

  // 维度3: 效率优化 (15分)
  const efficiency = gradeEfficiency(userCode, referenceCode)
  result.dimensions.efficiency = efficiency
  result.score += efficiency.score

  // 维度4: 可读性 (15分)
  const readability = gradeReadability(userCode)
  result.dimensions.readability = readability
  result.score += readability.score

  // 维度5: 最佳实践 (10分)
  const bestPractices = gradeBestPractices(userCode)
  result.dimensions.bestPractices = bestPractices
  result.score += bestPractices.score

  // 维度6: 项目相关性 (15分) - 新增核心维度
  const projectRelevance = gradeProjectRelevance(userCode, output, referenceCode, project)
  result.dimensions.projectRelevance = projectRelevance
  result.score += projectRelevance.score
  result.projectRelevance = projectRelevance

  // 生成综合反馈
  generateFeedback(result)

  return result
}

/**
 * 评分维度1: 代码功能性
 * 检查代码是否完成了项目要求的核心任务
 */
function gradeFunctionality(userCode, output, project) {
  const dimension = {
    name: '代码功能性',
    score: 0,
    maxScore: 25,
    details: []
  }

  let score = 0

  // 检查是否有输出结果
  if (output && output.trim().length > 0 && !output.includes('错误') && !output.includes('Error')) {
    score += 12
    dimension.details.push({ type: 'success', text: '代码成功执行并产生输出' })
  } else {
    dimension.details.push({ type: 'error', text: '代码执行失败或无有效输出' })
  }

  // 检查是否使用了项目要求的关键API
  if (project && project.tasks) {
    const requiredPatterns = extractRequiredPatterns(project)
    let matchedPatterns = 0

    requiredPatterns.forEach(pattern => {
      if (userCode.includes(pattern)) {
        matchedPatterns++
      }
    })

    const patternScore = Math.min(13, Math.round((matchedPatterns / Math.max(1, requiredPatterns.length)) * 13))
    score += patternScore

    if (patternScore >= 10) {
      dimension.details.push({ type: 'success', text: `使用了项目要求的关键方法 (${matchedPatterns}/${requiredPatterns.length})` })
    } else if (patternScore > 0) {
      dimension.details.push({ type: 'warning', text: `部分关键方法未使用 (${matchedPatterns}/${requiredPatterns.length})` })
    } else {
      dimension.details.push({ type: 'error', text: '未检测到项目要求的关键方法' })
    }
  }

  dimension.score = score
  return dimension
}

/**
 * 评分维度2: 语法正确性
 */
function gradeSyntax(userCode, output) {
  const dimension = {
    name: '语法正确性',
    score: 0,
    maxScore: 20,
    details: []
  }

  let score = 20

  // 检查执行输出中是否有错误
  if (output) {
    const errorPatterns = [
      'SyntaxError', 'NameError', 'TypeError', 'ValueError',
      'KeyError', 'IndexError', 'AttributeError', 'ImportError',
      '错误', 'Error', 'Exception', 'Traceback'
    ]

    let errorCount = 0
    errorPatterns.forEach(pattern => {
      if (output.includes(pattern)) {
        errorCount++
      }
    })

    if (errorCount > 0) {
      score -= Math.min(20, errorCount * 7)
      dimension.details.push({ type: 'error', text: `执行过程中出现 ${errorCount} 处错误` })
    } else {
      dimension.details.push({ type: 'success', text: '代码语法正确，无运行时错误' })
    }
  }

  // 检查常见的语法问题
  const syntaxIssues = []

  // 检查 Python 2 风格的 print
  const python2Print = userCode.match(/^print\s+['"]/gm)
  if (python2Print && python2Print.length > 0) {
    syntaxIssues.push('存在 Python 2 风格的 print 语句')
    score -= 3
  }

  // 检查未闭合的括号
  const openParens = (userCode.match(/\(/g) || []).length
  const closeParens = (userCode.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    syntaxIssues.push('括号可能未正确闭合')
    score -= 3
  }

  // 检查缩进问题（简单检查）
  const lines = userCode.split('\n')
  let indentIssue = false
  for (let i = 1; i < lines.length; i++) {
    const prevLine = lines[i - 1].trim()
    const currLine = lines[i]
    if (prevLine.endsWith(':') && currLine.trim().length > 0 && !currLine.startsWith(' ') && !currLine.startsWith('\t')) {
      indentIssue = true
      break
    }
  }
  if (indentIssue) {
    syntaxIssues.push('可能存在缩进错误（冒号后无缩进）')
    score -= 3
  }

  if (syntaxIssues.length > 0) {
    syntaxIssues.forEach(issue => {
      dimension.details.push({ type: 'warning', text: issue })
    })
  } else if (score >= 16) {
    dimension.details.push({ type: 'success', text: '代码结构良好，无明显语法隐患' })
  }

  dimension.score = Math.max(0, score)
  return dimension
}

/**
 * 评分维度3: 效率优化
 */
function gradeEfficiency(userCode, referenceCode) {
  const dimension = {
    name: '效率优化',
    score: 0,
    maxScore: 15,
    details: []
  }

  let score = 15

  // 检查是否使用了循环（向量化操作更优）
  const hasForLoop = /\bfor\b/.test(userCode)
  const hasApply = /\.apply\(/.test(userCode)
  const hasVectorized = /\.sum\(|\.mean\(|\.std\(|\.max\(|\.min\(/.test(userCode)

  if (hasForLoop && !hasApply && !hasVectorized) {
    score -= 4
    dimension.details.push({ type: 'warning', text: '建议优先使用 Pandas 向量化操作替代纯 Python 循环' })
  } else if (hasVectorized || hasApply) {
    dimension.details.push({ type: 'success', text: '使用了向量化操作，效率较好' })
  }

  // 检查是否导入了未使用的库
  const imports = userCode.match(/^import\s+(\w+)|^from\s+(\S+)\s+import/gm) || []
  const unusedImports = []
  imports.forEach(imp => {
    const lib = imp.replace(/^import\s+/, '').replace(/^from\s+/, '').split(' ')[0]
    if (lib && !userCode.includes(lib + '.')) {
      unusedImports.push(lib)
    }
  })
  if (unusedImports.length > 0) {
    score -= 2
    dimension.details.push({ type: 'warning', text: `可能导入了未使用的库: ${unusedImports.join(', ')}` })
  }

  // 检查重复计算
  const duplicatedPatterns = findDuplicatedPatterns(userCode)
  if (duplicatedPatterns.length > 0) {
    score -= 2
    dimension.details.push({ type: 'warning', text: '存在可提取为变量的重复表达式' })
  }

  if (score >= 13) {
    dimension.details.push({ type: 'success', text: '代码效率良好' })
  }

  dimension.score = Math.max(0, score)
  return dimension
}

/**
 * 评分维度4: 可读性
 */
function gradeReadability(userCode) {
  const dimension = {
    name: '可读性',
    score: 0,
    maxScore: 15,
    details: []
  }

  let score = 15

  // 检查是否有注释
  const commentLines = (userCode.match(/#.*/g) || []).length
  const totalLines = userCode.split('\n').filter(l => l.trim().length > 0).length
  const commentRatio = totalLines > 0 ? commentLines / totalLines : 0

  if (commentRatio < 0.05) {
    score -= 4
    dimension.details.push({ type: 'warning', text: '代码注释较少，建议添加关键步骤说明' })
  } else if (commentRatio > 0.3) {
    score -= 2
    dimension.details.push({ type: 'warning', text: '注释比例过高，可能影响代码可读性' })
  } else {
    dimension.details.push({ type: 'success', text: '注释比例适中' })
  }

  // 检查变量命名
  const varPattern = /\b([a-zA-Z_]\w*)\s*=/g
  const vars = []
  let match
  while ((match = varPattern.exec(userCode)) !== null) {
    vars.push(match[1])
  }

  const shortVars = vars.filter(v => v.length <= 1 && v !== '_')
  if (shortVars.length > 2) {
    score -= 3
    dimension.details.push({ type: 'warning', text: '存在过多单字符变量名，建议使用有意义的命名' })
  } else {
    dimension.details.push({ type: 'success', text: '变量命名较为清晰' })
  }

  // 检查代码格式（空行使用）
  const lines = userCode.split('\n')
  const blankLines = lines.filter(l => l.trim().length === 0).length
  if (blankLines < 2 && lines.length > 15) {
    score -= 2
    dimension.details.push({ type: 'warning', text: '建议通过空行分隔不同逻辑块' })
  }

  dimension.score = Math.max(0, score)
  return dimension
}

/**
 * 评分维度5: 最佳实践
 */
function gradeBestPractices(userCode) {
  const dimension = {
    name: '最佳实践',
    score: 0,
    maxScore: 10,
    details: []
  }

  let score = 10

  // 检查是否有错误处理
  const hasTryExcept = /\btry\b/.test(userCode)
  if (!hasTryExcept && userCode.length > 200) {
    score -= 2
    dimension.details.push({ type: 'info', text: '建议对关键操作添加异常处理 (try-except)' })
  } else if (hasTryExcept) {
    dimension.details.push({ type: 'success', text: '包含异常处理机制' })
  }

  // 检查是否使用了 inplace=True（Pandas 最佳实践）
  const hasInplace = /inplace\s*=\s*True/.test(userCode)
  if (hasInplace) {
    score -= 2
    dimension.details.push({ type: 'warning', text: '建议避免使用 inplace=True，直接赋值更清晰' })
  }

  // 检查是否使用了链式赋值
  const chainedAssignment = /\.loc\[.*\]\s*=/.test(userCode)
  if (chainedAssignment) {
    dimension.details.push({ type: 'success', text: '正确使用 .loc 进行赋值' })
  }

  // 检查是否硬编码了随机种子（可复现性）
  const hasRandomSeed = /random\.seed\(|np\.random\.seed\(/.test(userCode)
  if (hasRandomSeed) {
    dimension.details.push({ type: 'success', text: '设置了随机种子，保证结果可复现' })
  }

  dimension.score = Math.max(0, score)
  return dimension
}

/**
 * 评分维度6: 项目相关性 (新增核心维度)
 * 评估代码与项目目标、需求和架构的匹配程度
 */
function gradeProjectRelevance(userCode, output, referenceCode, project) {
  const dimension = {
    name: '项目相关性',
    score: 0,
    maxScore: 15,
    details: [],
    analysis: {
      objectiveAlignment: [],
      requirementCoverage: [],
      architectureConsistency: [],
      impactAssessment: []
    }
  }

  let score = 0

  if (!project) {
    dimension.details.push({ type: 'warning', text: '未找到项目信息，无法评估项目相关性' })
    dimension.score = 0
    return dimension
  }

  // 1. 项目目标对齐度 (5分)
  const objectiveScore = evaluateObjectiveAlignment(userCode, project, dimension)
  score += objectiveScore

  // 2. 需求覆盖度 (5分)
  const requirementScore = evaluateRequirementCoverage(userCode, output, project, dimension)
  score += requirementScore

  // 3. 架构一致性 (3分)
  const architectureScore = evaluateArchitectureConsistency(userCode, referenceCode, project, dimension)
  score += architectureScore

  // 4. 成功指标影响 (2分)
  const impactScore = evaluateProjectImpact(userCode, output, project, dimension)
  score += impactScore

  dimension.score = Math.min(15, score)
  return dimension
}

/**
 * 评估代码与项目目标的对齐度
 */
function evaluateObjectiveAlignment(userCode, project, dimension) {
  let score = 0
  const alignment = dimension.analysis.objectiveAlignment

  // 检查项目背景中的核心目标
  const projectGoals = []
  if (project.background) {
    if (project.background.description) projectGoals.push(project.background.description)
    if (project.background.problem) projectGoals.push(project.background.problem)
    if (project.background.significance) projectGoals.push(project.background.significance)
  }

  // 提取项目关键词
  const projectKeywords = extractProjectKeywords(projectGoals.join(' '))

  // 检查代码中是否涉及这些核心概念
  let matchedKeywords = 0
  const keywordMatches = []

  projectKeywords.forEach(keyword => {
    const keywordPattern = new RegExp(`\\b${keyword}\\b`, 'i')
    if (keywordPattern.test(userCode)) {
      matchedKeywords++
      keywordMatches.push(keyword)
    }
  })

  const keywordScore = Math.min(3, Math.round((matchedKeywords / Math.max(1, projectKeywords.length)) * 3))
  score += keywordScore

  if (keywordScore >= 2) {
    alignment.push({
      type: 'success',
      text: `代码涉及项目核心概念 (${matchedKeywords}/${projectKeywords.length}): ${keywordMatches.slice(0, 5).join(', ')}`
    })
  } else if (keywordScore > 0) {
    alignment.push({
      type: 'warning',
      text: `代码仅部分涉及项目核心概念 (${matchedKeywords}/${projectKeywords.length})`
    })
  } else {
    alignment.push({
      type: 'error',
      text: '代码未体现项目核心目标相关的关键概念'
    })
  }

  // 检查是否使用了项目类别相关的典型方法
  const categoryPatterns = getCategoryPatterns(project.category)
  let matchedCategoryPatterns = 0
  const matchedPatterns = []

  categoryPatterns.forEach(pattern => {
    if (userCode.includes(pattern)) {
      matchedCategoryPatterns++
      matchedPatterns.push(pattern)
    }
  })

  const categoryScore = Math.min(2, Math.round((matchedCategoryPatterns / Math.max(1, categoryPatterns.length)) * 2))
  score += categoryScore

  if (categoryScore >= 1) {
    alignment.push({
      type: 'success',
      text: `使用了${project.category || '项目'}领域的典型方法: ${matchedPatterns.slice(0, 3).join(', ')}`
    })
  } else {
    alignment.push({
      type: 'warning',
      text: `未使用${project.category || '项目'}领域的典型分析方法`
    })
  }

  return score
}

/**
 * 评估代码对项目需求的覆盖度
 */
function evaluateRequirementCoverage(userCode, output, project, dimension) {
  let score = 0
  const coverage = dimension.analysis.requirementCoverage

  if (!project.tasks || project.tasks.length === 0) {
    coverage.push({ type: 'info', text: '项目未定义具体任务需求' })
    return score
  }

  // 检查每个任务的完成情况
  let completedTasks = 0
  const taskResults = []

  project.tasks.forEach((task, index) => {
    const taskGoal = task.goal || ''
    const taskPatterns = extractTaskPatterns(taskGoal)

    let taskCompleted = false
    let matchedPatterns = 0

    taskPatterns.forEach(pattern => {
      if (userCode.includes(pattern)) {
        matchedPatterns++
      }
    })

    // 任务完成判断：使用了任务要求的方法，且输出中有相关结果
    if (matchedPatterns > 0) {
      taskCompleted = true
      completedTasks++
    }

    taskResults.push({
      task: `任务 ${index + 1}`,
      goal: taskGoal,
      completed: taskCompleted,
      matched: matchedPatterns,
      total: taskPatterns.length
    })
  })

  const taskScore = Math.min(4, Math.round((completedTasks / project.tasks.length) * 4))
  score += taskScore

  if (taskScore >= 3) {
    coverage.push({
      type: 'success',
      text: `完成了 ${completedTasks}/${project.tasks.length} 个核心任务`
    })
  } else if (taskScore > 0) {
    coverage.push({
      type: 'warning',
      text: `仅完成 ${completedTasks}/${project.tasks.length} 个核心任务，建议补充遗漏的功能`
    })
  } else {
    coverage.push({
      type: 'error',
      text: '未检测到任何任务需求的实现'
    })
  }

  // 检查输出结果是否包含预期的交付物
  if (output && project.tasks) {
    const deliverables = project.tasks
      .map(t => t.deliverable || '')
      .filter(d => d.length > 0)

    let hasDeliverableOutput = false
    deliverables.forEach(deliverable => {
      const keyTerms = deliverable.split(/[,，;；]/).map(s => s.trim()).filter(s => s.length > 2)
      keyTerms.forEach(term => {
        if (output.includes(term) || output.includes(term.slice(0, 10))) {
          hasDeliverableOutput = true
        }
      })
    })

    if (hasDeliverableOutput) {
      score += 1
      coverage.push({ type: 'success', text: '输出结果包含预期的交付物内容' })
    } else {
      coverage.push({ type: 'warning', text: '输出结果可能缺少预期的交付物' })
    }
  }

  return score
}

/**
 * 评估代码与项目架构的一致性
 */
function evaluateArchitectureConsistency(userCode, referenceCode, project, dimension) {
  let score = 0
  const consistency = dimension.analysis.architectureConsistency

  // 检查是否遵循项目的数据处理流程
  if (referenceCode) {
    // 提取参考答案中的核心步骤顺序
    const refSteps = extractProcessingSteps(referenceCode)
    const userSteps = extractProcessingSteps(userCode)

    let alignedSteps = 0
    const stepAlignments = []

    refSteps.forEach((refStep, index) => {
      const userHasSimilar = userSteps.some(userStep =>
        userStep.type === refStep.type ||
        (userStep.method && refStep.method && userStep.method.includes(refStep.method))
      )

      if (userHasSimilar) {
        alignedSteps++
        stepAlignments.push(refStep.type)
      }
    })

    const alignmentRatio = refSteps.length > 0 ? alignedSteps / refSteps.length : 0
    const stepScore = Math.min(2, Math.round(alignmentRatio * 2))
    score += stepScore

    if (stepScore >= 1) {
      consistency.push({
        type: 'success',
        text: `数据处理流程与项目架构 ${Math.round(alignmentRatio * 100)}% 对齐`
      })
    } else {
      consistency.push({
        type: 'warning',
        text: '数据处理流程与项目标准架构差异较大'
      })
    }
  }

  // 检查是否使用了项目推荐的技术栈
  const techStack = project.techPoints?.selection || ''
  const recommendedTech = extractTechStack(techStack)

  let usedRecommendedTech = 0
  const usedTech = []

  recommendedTech.forEach(tech => {
    if (userCode.includes(tech)) {
      usedRecommendedTech++
      usedTech.push(tech)
    }
  })

  const techScore = Math.min(1, Math.round((usedRecommendedTech / Math.max(1, recommendedTech.length))))
  score += techScore

  if (techScore > 0) {
    consistency.push({
      type: 'success',
      text: `使用了项目推荐的技术: ${usedTech.slice(0, 3).join(', ')}`
    })
  } else {
    consistency.push({
      type: 'info',
      text: '可考虑采用项目推荐的技术方案以提升一致性'
    })
  }

  return score
}

/**
 * 评估代码对项目成功指标的影响
 */
function evaluateProjectImpact(userCode, output, project, dimension) {
  let score = 0
  const impact = dimension.analysis.impactAssessment

  // 检查完成标准中的关键指标
  if (project.completionCriteria) {
    const criteria = project.completionCriteria
    const criteriaChecks = []

    // 功能完整性检查
    if (criteria.functional) {
      const functionalKeywords = criteria.functional.split(/[,，;；]/).map(s => s.trim()).filter(s => s.length > 3)
      let functionalMet = 0

      functionalKeywords.forEach(keyword => {
        const cleanKeyword = keyword.replace(/[（(].*?[)）]/g, '').trim()
        if (cleanKeyword.length > 3 && (
          userCode.includes(cleanKeyword) ||
          (output && output.includes(cleanKeyword))
        )) {
          functionalMet++
        }
      })

      if (functionalMet > 0) {
        criteriaChecks.push({ type: 'success', text: `满足功能完整性要求 (${functionalMet}项)` })
        score += 1
      } else {
        criteriaChecks.push({ type: 'warning', text: '建议对照功能完整性标准完善代码' })
      }
    }

    // 质量要求检查
    if (criteria.quality) {
      impact.push({
        type: 'info',
        text: `质量要求: ${criteria.quality.slice(0, 50)}...`
      })
    }

    criteriaChecks.forEach(check => impact.push(check))
  }

  // 检查输出质量
  if (output) {
    const outputLines = output.split('\n').filter(l => l.trim().length > 0)
    if (outputLines.length >= 3) {
      impact.push({ type: 'success', text: `输出结果包含 ${outputLines.length} 行有效内容` })
    } else {
      impact.push({ type: 'warning', text: '输出内容较少，建议增加结果展示' })
    }
  }

  return Math.min(2, score)
}

/**
 * 生成综合反馈
 */
function generateFeedback(result) {
  const { score, dimensions } = result

  // 根据总分生成总结
  if (score >= 90) {
    result.summary = '优秀！代码质量很高，与项目目标高度对齐，功能完整且符合最佳实践。'
  } else if (score >= 75) {
    result.summary = '良好！代码基本满足项目要求，与目标较为对齐，仍有少量优化空间。'
  } else if (score >= 60) {
    result.summary = '及格。代码功能基本实现，但项目相关性有待加强，建议参考需求文档完善。'
  } else if (score >= 40) {
    result.summary = '待改进。代码存在较多问题，与项目目标对齐度不足，建议重新审视项目需求。'
  } else {
    result.summary = '需要重做。代码与项目目标严重偏离，请仔细阅读项目需求后重新实现。'
  }

  // 收集所有维度的建议
  Object.values(dimensions).forEach(dim => {
    dim.details.forEach(detail => {
      if (detail.type === 'warning' || detail.type === 'error') {
        result.suggestions.push(`[${dim.name}] ${detail.text}`)
      }
    })
  })

  // 收集优点
  Object.values(dimensions).forEach(dim => {
    dim.details.forEach(detail => {
      if (detail.type === 'success') {
        result.feedback.push(`[${dim.name}] ${detail.text}`)
      }
    })
  })
}

/**
 * 从项目任务中提取要求使用的关键方法模式
 */
function extractRequiredPatterns(project) {
  const patterns = []
  if (!project || !project.tasks) return patterns

  const taskTexts = project.tasks.map(t => t.goal || '').join(' ')

  // 常见的 Pandas 方法映射
  const methodMap = {
    'pd.read_csv': ['read_csv'],
    'str.replace': ['str.replace', 'replace('],
    'apply': ['.apply('],
    'pd.to_datetime': ['to_datetime'],
    'fillna': ['fillna'],
    'dropna': ['dropna'],
    'pivot_table': ['pivot_table'],
    'groupby': ['groupby'],
    'shift': ['shift'],
    'cumsum': ['cumsum'],
    'diff': ['.diff('],
    'resample': ['resample'],
    'rolling': ['rolling'],
    'merge_asof': ['merge_asof'],
    'crosstab': ['crosstab'],
    'qcut': ['qcut'],
    'cut': ['pd.cut'],
    'explode': ['explode'],
    'iterrows': ['iterrows'],
    'itertuples': ['itertuples']
  }

  Object.entries(methodMap).forEach(([key, values]) => {
    if (taskTexts.includes(key)) {
      patterns.push(...values)
    }
  })

  return [...new Set(patterns)]
}

/**
 * 提取项目关键词
 */
function extractProjectKeywords(text) {
  const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'of', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'to', 'in', 'and', 'or',
    '使用', '通过', '进行', '实现', '完成', '需要', '根据', '基于', '对', '将', '的', '了', '是'])

  const words = text.toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !commonWords.has(w))

  // 提取中文词组
  const chineseWords = text.match(/[\u4e00-\u9fa5]{2,}/g) || []

  return [...new Set([...words, ...chineseWords])].slice(0, 20)
}

/**
 * 获取项目类别对应的典型方法模式
 */
function getCategoryPatterns(category) {
  const patterns = {
    '数据清洗': ['to_datetime', 'fillna', 'dropna', 'replace', 'apply', 'regex', 'str.'],
    '数据重塑': ['pivot_table', 'groupby', 'diff', 'cumsum', 'shift', 'melt', 'stack'],
    '关联分析': ['groupby', 'merge', 'join', 'concat', 'corr', 'crosstab'],
    '客户分析': ['qcut', 'cut', 'agg', 'rank', 'sort_values', 'value_counts'],
    '聚类分析': ['kmeans', 'cluster', 'normalize', 'scale', 'distance'],
    '时间序列': ['resample', 'rolling', 'shift', 'diff', 'datetime', 'freq'],
    '归因分析': ['merge_asof', 'groupby', 'agg', 'sum', 'mean'],
    '文本分析': ['str.', 'replace', 'split', 'contains', 'regex', 'apply'],
    '帕累托分析': ['cumsum', 'sort_values', 'sum', 'groupby', 'rank'],
    '综合实战': ['crosstab', 'dot', 'merge', 'groupby', 'pivot_table']
  }

  return patterns[category] || ['groupby', 'apply', 'merge', 'agg']
}

/**
 * 从任务描述中提取方法模式
 */
function extractTaskPatterns(taskGoal) {
  const patterns = []
  const methodMap = {
    'pivot_table': ['pivot_table'],
    'groupby': ['groupby'],
    'diff': ['.diff('],
    'shift': ['shift'],
    'cumsum': ['cumsum'],
    'fillna': ['fillna'],
    'dropna': ['dropna'],
    'apply': ['.apply('],
    'merge': ['merge'],
    'concat': ['concat'],
    'join': ['join'],
    'sort': ['sort_values'],
    'rank': ['rank'],
    'qcut': ['qcut'],
    'cut': ['pd.cut'],
    'resample': ['resample'],
    'rolling': ['rolling'],
    'to_datetime': ['to_datetime'],
    'read_csv': ['read_csv'],
    'value_counts': ['value_counts'],
    'corr': ['.corr('],
    'crosstab': ['crosstab'],
    'merge_asof': ['merge_asof']
  }

  Object.entries(methodMap).forEach(([key, values]) => {
    if (taskGoal.includes(key)) {
      patterns.push(...values)
    }
  })

  return [...new Set(patterns)]
}

/**
 * 提取代码中的处理步骤
 */
function extractProcessingSteps(code) {
  const steps = []
  const lines = code.split('\n')

  const stepPatterns = [
    { pattern: /pd\.read_csv|pd\.DataFrame/, type: '数据加载', method: 'read_csv' },
    { pattern: /to_datetime|astype/, type: '数据转换', method: 'to_datetime' },
    { pattern: /fillna|dropna|replace|clean/, type: '数据清洗', method: 'fillna' },
    { pattern: /groupby|pivot_table|crosstab/, type: '数据分组', method: 'groupby' },
    { pattern: /merge|join|concat/, type: '数据合并', method: 'merge' },
    { pattern: /apply|map|transform/, type: '数据变换', method: 'apply' },
    { pattern: /sort_values|rank/, type: '数据排序', method: 'sort_values' },
    { pattern: /plot|hist|scatter/, type: '数据可视化', method: 'plot' },
    { pattern: /print|to_dict|to_string/, type: '结果输出', method: 'print' }
  ]

  stepPatterns.forEach(({ pattern, type, method }) => {
    if (pattern.test(code)) {
      steps.push({ type, method })
    }
  })

  return steps
}

/**
 * 提取项目推荐的技术栈
 */
function extractTechStack(techText) {
  if (!techText) return []

  const techPatterns = [
    'pivot_table', 'groupby', 'merge', 'concat', 'join',
    'apply', 'transform', 'agg', 'filter',
    'fillna', 'dropna', 'replace',
    'to_datetime', 'resample', 'rolling',
    'qcut', 'cut', 'rank',
    'kmeans', 'cluster',
    'corr', 'crosstab'
  ]

  return techPatterns.filter(tech => techText.includes(tech))
}

/**
 * 查找代码中重复出现的表达式模式
 */
function findDuplicatedPatterns(code) {
  const patterns = []
  const lines = code.split('\n')
  const expressions = {}

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    // 简单匹配：重复的函数调用或属性访问
    const matches = trimmed.match(/\w+\.\w+\([^)]*\)/g) || []
    matches.forEach(match => {
      if (match.length > 10) {
        expressions[match] = (expressions[match] || 0) + 1
      }
    })
  })

  Object.entries(expressions).forEach(([expr, count]) => {
    if (count > 2) {
      patterns.push(expr)
    }
  })

  return patterns
}

/**
 * 格式化评分结果为可展示的文本
 */
export function formatGradeResult(result) {
  if (!result) return ''

  const lines = []
  lines.push('='.repeat(50))
  lines.push(`📊 代码评分报告 | 总分: ${result.score}/${result.maxScore}`)
  lines.push('='.repeat(50))
  lines.push('')

  // 各维度得分
  Object.values(result.dimensions).forEach(dim => {
    const icon = dim.score >= dim.maxScore * 0.8 ? '✅' : dim.score >= dim.maxScore * 0.6 ? '⚠️' : '❌'
    lines.push(`${icon} ${dim.name}: ${dim.score}/${dim.maxScore}`)
    dim.details.forEach(detail => {
      const detailIcon = detail.type === 'success' ? '  ✓' : detail.type === 'error' ? '  ✗' : '  ›'
      lines.push(`${detailIcon} ${detail.text}`)
    })
    lines.push('')
  })

  // 项目相关性详细分析
  if (result.projectRelevance) {
    lines.push('-'.repeat(50))
    lines.push('📋 项目相关性深度分析')
    lines.push('-'.repeat(50))
    lines.push('')

    const pr = result.projectRelevance

    if (pr.analysis.objectiveAlignment.length > 0) {
      lines.push('【项目目标对齐度】')
      pr.analysis.objectiveAlignment.forEach(item => {
        const icon = item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : '›'
        lines.push(`  ${icon} ${item.text}`)
      })
      lines.push('')
    }

    if (pr.analysis.requirementCoverage.length > 0) {
      lines.push('【需求覆盖度】')
      pr.analysis.requirementCoverage.forEach(item => {
        const icon = item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : '›'
        lines.push(`  ${icon} ${item.text}`)
      })
      lines.push('')
    }

    if (pr.analysis.architectureConsistency.length > 0) {
      lines.push('【架构一致性】')
      pr.analysis.architectureConsistency.forEach(item => {
        const icon = item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : '›'
        lines.push(`  ${icon} ${item.text}`)
      })
      lines.push('')
    }

    if (pr.analysis.impactAssessment.length > 0) {
      lines.push('【项目影响评估】')
      pr.analysis.impactAssessment.forEach(item => {
        const icon = item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : '›'
        lines.push(`  ${icon} ${item.text}`)
      })
      lines.push('')
    }
  }

  // 综合评价
  lines.push('-'.repeat(50))
  lines.push(`💡 综合评价: ${result.summary}`)
  lines.push('')

  // 优点
  if (result.feedback.length > 0) {
    lines.push('👍 优点:')
    result.feedback.slice(0, 5).forEach(fb => lines.push(`  • ${fb}`))
    lines.push('')
  }

  // 改进建议
  if (result.suggestions.length > 0) {
    lines.push('🔧 改进建议:')
    result.suggestions.slice(0, 5).forEach(sg => lines.push(`  • ${sg}`))
    lines.push('')
  }

  lines.push('='.repeat(50))

  return lines.join('\n')
}
