import { useEffect, useState } from "react"
import { Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Star as StarIcon, DoNotDisturb as DoNotDisturbIcon } from "@mui/icons-material"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import InfiniteScroll from "react-infinite-scroll-component"
import * as yup from "yup"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import { TooltipIconButton, CardWrapper, CheckboxedItem, AreYouSureDialog, PasswordField } from "../../components/common/library"
import { ProtectedPage } from "../../components/templates/page-template"
import { RequestorPrams, RequestState, useRequest } from "../../utils/requestor"
import { isEmpty, ModPerm } from "../../utils/other"
import { useAppSelector } from "../../data/hooks"
import { DefaultLoading } from "../../components/templates/default-pages"
import { ErrorDescription, ErrorFormText, TextFieldController } from "../../components/common/forms"

interface ModeratorData {
  id: number
  username: string
  superuser: boolean
  permissions: number[]
}

interface ModeratorDialogProps {
  open: boolean
  onClose: () => void
  updateModerator: (id: number, data?: ModeratorData) => void
  protectedRequest: (params: RequestorPrams) => void
}

interface RemoveModeratorDialogProps extends ModeratorDialogProps {
  data: ModeratorData
}

function RemoveModeratorDialog({ data, open, onClose, updateModerator, protectedRequest }: RemoveModeratorDialogProps) {
  const { t } = useTranslation("superuser")

  function confirm() {
    protectedRequest({
      path: `/moderators/${data.id}/`,
      request: { method: "delete" },
      setState: ({ code, error }: RequestState) => {
        if (code === 200) {
          updateModerator(data.id)
          onClose()
        } else console.log("Error!", code, error)
      }
    })
  }

  return <AreYouSureDialog
    open={open}
    confirm={confirm}
    cancel={onClose}
  >
    <Typography variant="body1">
      {t("confirm-delete-question", { username: data.username })}
    </Typography>
    <Typography variant="body1" color="error">
      {t("confirm-delete-alert")}
    </Typography>
  </AreYouSureDialog>
}

function schemaFactory(newEntry: boolean) {
  return yup
    .object({
      username: yup.string().max(100).required(),
      password: newEntry ? yup.string().max(100).required() : yup.string().max(100),
    })
    .required()
}

interface EditModeratorDialogProps extends ModeratorDialogProps {
  data?: ModeratorData
  globalPermissions: ModPerm[]
}

function EditModeratorDialog({ data, open, onClose, globalPermissions, updateModerator, protectedRequest }: EditModeratorDialogProps) {
  const { t } = useTranslation("superuser")

  const newEntry = data === undefined
  const myPerms: undefined | number[] = useAppSelector(state => state.moderator.permissions?.map(item => item.id))
  const initialPerms: number[] = data === undefined ? [] : data.permissions

  const [permissions, setPermissions] = useState<number[]>(() => initialPerms)
  const { control, handleSubmit, formState: { errors }, reset: resetForm } = useForm(
    { resolver: yupResolver(schemaFactory(newEntry)), })

  const usernameError = !!errors?.username?.type
  const passwordError = !!errors?.password?.type
  const anyError = usernameError || passwordError

  const errorDescription: ErrorDescription[] = []
  if (anyError) {
    if (usernameError) {
      if (errors?.username?.type === "max") errorDescription.push({ field: "username", type: "too-long" })
      if (errors?.username?.type === "required") errorDescription.push({ field: "username", type: "required" })
    }
    if (passwordError) {
      if (errors?.password?.type === "max") errorDescription.push({ field: "new-password", type: "too-long" })
      if (errors?.password?.type === "required") errorDescription.push({ field: "new-password", type: "required" })
    }
  }

  function close() {
    setPermissions(initialPerms)
    resetForm()
    onClose()
  }

  const submit = handleSubmit((newData: any) => {
    if (newData.username === data?.username) delete newData.username
    if (isEmpty(newData.password)) delete newData.password

    newData["append-perms"] = permissions.filter(x => !initialPerms.includes(x))
    newData["remove-perms"] = initialPerms.filter(x => !permissions.includes(x))

    if (newData.username || newData.password || newData["append-perms"].length > 0 || newData["remove-perms"].length > 0) {
      protectedRequest({
        path: newEntry ? "/moderators/" : `/moderators/${data.id}/`,
        body: newData,
        request: { method: "post" },
        setState: ({ code, data: serverData, error }) => {
          if (code === 200) {
            if (newEntry) {
              updateModerator(serverData.id, { ...serverData, permissions: serverData.permissions.map((p: ModPerm) => p.id) })
              setPermissions(initialPerms)
              resetForm()
            } else {
              updateModerator(data.id, { ...data, ...newData, permissions })
            }
            onClose()
          } else console.log("Error!", code, error)
        }
      })
    } else onClose()
  })

  return <Dialog open={open}>
    <DialogTitle>
      {t((newEntry ? "creating" : "editing") + "-mod-title")}
      <IconButton
        onClick={close}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <TextFieldController
        name="username"
        control={control}
        defaultValue={data?.username === undefined ? "" : data?.username}
        error={usernameError}
      />
      <TextFieldController
        name="new-password"
        autoComplete="none"
        defaultValue=""
        control={control}
        error={passwordError}
        Field={PasswordField}
      />
      <ErrorFormText
        errors={errorDescription}
      />
      <Paper sx={{ mt: 2, overflowY: "auto", maxHeight: 300 }}>
        <Stack
          direction="column"
          justifyItems="center"
          alignItems="center"
        >
          {globalPermissions.map((perm, key) =>
            <CheckboxedItem
              key={key}
              disabled={!myPerms?.includes(perm.id)}
              disabledText={t("no-edit-perm")}
              fullWidth
              text={perm.name}
              checked={permissions.includes(perm.id)}
              setChecked={(value) => {
                if (value) setPermissions([perm.id, ...permissions])
                else setPermissions(permissions.filter((v) => v !== perm.id))
              }}
            />
          )}
        </Stack>
      </Paper>
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={submit}
      >
        {t((newEntry ? "creating" : "editing") + "-mod-action")}
      </Button>
    </DialogContent>
  </Dialog>
}

const cardHeight: number = 60

interface ModeratorCardProps {
  data: ModeratorData
  globalPermissions: ModPerm[]
  updateModerator: (id: number, data?: ModeratorData) => void
  protectedRequest: (params: RequestorPrams) => void
}

function SuperuserCard({ data }: ModeratorCardProps) {
  const { t } = useTranslation("superuser")

  return <Tooltip title={t("tooltip-superusers")}>
    <Paper>
      <Stack direction="row" spacing={1} sx={{ p: 1, alignItems: "center", justifyContent: "center", height: cardHeight }}>
        <StarIcon color="warning" />
        <Typography flexGrow={1} variant="body1">
          {data.username}
        </Typography>
        <DoNotDisturbIcon color="error" />
      </Stack>
    </Paper>
  </Tooltip>
}

function ModeratorCard({ data, ...other }: ModeratorCardProps) {
  const [hover, setHover] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [removing, setRemoving] = useState<boolean>(false)

  const { t } = useTranslation("superuser")

  return <>
    <RemoveModeratorDialog data={data} open={removing} onClose={() => setRemoving(false)} {...other} />
    <EditModeratorDialog data={data} open={editing} onClose={() => setEditing(false)} {...other} />
    <Paper
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ p: 1, alignItems: "center", justifyContent: "center", height: cardHeight }}
      >
        {hover && <TooltipIconButton
          onClick={() => setEditing(true)}
          title={t("edit-perms")}
          Icon={EditIcon}
        />}
        <Typography
          variant="body1"
          flexGrow={1}
          sx={{ p: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
        >
          {data.username}
        </Typography>
        {hover && <TooltipIconButton
          onClick={() => setRemoving(true)}
          title={t("remove-mod")}
          Icon={DeleteIcon}
        />}
      </Stack>
    </Paper>
  </>
}

function ModeratorCardSwitch(props: ModeratorCardProps) {
  if (props.data.superuser) return <SuperuserCard {...props} />
  return <ModeratorCard {...props} />
}

export default function ManageMods() {
  const { t: tCommon } = useTranslation("common")
  const { t } = useTranslation("superuser")

  const [creating, setCreating] = useState<boolean>(false)

  const { data: globalPermissions, code: code1, protectedRequest } = useRequest("/permissions/")

  const [moderators, setModerators] = useState<ModeratorData[]>([])
  const [hasNext, setHasNext] = useState<boolean>(false)
  const [code2, setCode2] = useState<number>(0)

  function setAll({ code, data: { results, "has-next": hasMore } = {} }: RequestState) {
    if (code === 200) {
      setModerators([...moderators, ...results.map((x: any) => ({ ...x, permissions: x.permissions.map((p: ModPerm) => p.id) }))])
      setHasNext(hasMore)
    }
    setCode2(code)
  }

  const loadMore = () => protectedRequest({ path: "/moderators/?offset=" + moderators.length.toString(), setState: setAll })
  useEffect(loadMore, [setModerators, setHasNext])

  function updateModerator(newModId: number, newMod?: ModeratorData) {
    const newModerators = [...moderators]
    const index = moderators.findIndex(mod => mod.id === newModId)
    if (newMod === undefined) {
      newModerators.splice(index, 1)
    } else if (index !== -1) {
      newModerators.splice(index, 1, newMod)
    } else {
      newModerators.splice(0, 0, newMod)
    }
    setModerators(newModerators)
  }

  return <ProtectedPage
    code={code1 === 200 ? code2 : code1}
    title={`${t("title")} | ${tCommon("app-name")}`}
  >
    <EditModeratorDialog
      open={creating}
      onClose={() => setCreating(false)}
      globalPermissions={globalPermissions}
      protectedRequest={protectedRequest}
      updateModerator={updateModerator}
    />
    <Stack sx={{ maxWidth: 1200, width: "100%", m: "auto", py: 4, px: 2, textAlign: "center" }} direction="column">
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t("headline")}
      </Typography>
      {moderators !== undefined &&
        <InfiniteScroll
          dataLength={moderators.length}
          next={loadMore}
          hasMore={hasNext === true}
          loader={<DefaultLoading />}
        >
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <CardWrapper height={cardHeight} onClick={() => setCreating(true)}>
                <AddIcon />
              </CardWrapper>
            </Grid>
            {(moderators)?.map(
              (data, index) => <Grid item xs={3} key={index}>
                <ModeratorCardSwitch
                  data={data}
                  globalPermissions={globalPermissions}
                  protectedRequest={protectedRequest}
                  updateModerator={updateModerator}
                />
              </Grid>
            )}
          </Grid>
        </InfiniteScroll>
      }
    </Stack>
  </ProtectedPage >
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...await serverSideTranslations(locale, ["common", "forms", "superuser"]),
  },
})
